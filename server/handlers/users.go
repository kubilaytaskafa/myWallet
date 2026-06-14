package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"log"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

type UserHandler struct {
	DB  *gorm.DB
	Cfg *config.AppConfig
}

func NewUserHandler(db *gorm.DB, cfg *config.AppConfig) *UserHandler {
	return &UserHandler{DB: db, Cfg: cfg}
}

type loginDTO struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type registerDTO struct {
	Name     string `json:"name"`
	Surname  string `json:"surname"`
	Email    string `json:"email"`
	Password string `json:"password"`
}

type forgotPasswordDTO struct {
	Email string `json:"email"`
}

type resetPasswordDTO struct {
	Token    string `json:"token"`
	Password string `json:"password"`
}

func (h *UserHandler) Login(c *fiber.Ctx) error {
	var loginUser loginDTO
	if err := c.BodyParser(&loginUser); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	var user models.User
	if err := h.DB.Where("email = ?", loginUser.Email).First(&user).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Kullanıcı bulunamadı")
	}

	if !utils.VerifyPassword(loginUser.Password, user.Password) {
		return utils.FailResponse(c, fiber.StatusUnauthorized, "Geçersiz kimlik bilgileri")
	}

	token, err := utils.GenerateToken(user.ID, h.Cfg.SecretKey)
	if err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Token oluşturulamadı")
	}

	responseData := fiber.Map{
		"status":  "success",
		"message": "Giriş başarılı",
		"userId":  user.ID,
		"name":    user.Name,
		"surname": user.Surname,
		"email":   user.Email,
		"token":   token,
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Giriş başarılı", responseData)
}

func (h *UserHandler) Register(c *fiber.Ctx) error {
	var registerUser registerDTO
	if err := c.BodyParser(&registerUser); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	var existingUser models.User
	if err := h.DB.Where("email = ?", registerUser.Email).First(&existingUser).Error; err == nil {
		return utils.FailResponse(c, fiber.StatusConflict, "Bu e-posta zaten kullanımda")
	}

	hashedPassword, err := utils.HashPassword(registerUser.Password)
	if err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Şifre hashlenemedi")
	}

	user := models.User{
		Name:     registerUser.Name,
		Surname:  registerUser.Surname,
		Email:    registerUser.Email,
		Password: hashedPassword,
	}

	if err := h.DB.Create(&user).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Kullanıcı oluşturulamadı")
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Kullanıcı başarıyla oluşturuldu", fiber.Map{
		"id":      user.ID,
		"name":    user.Name,
		"surname": user.Surname,
		"email":   user.Email,
	})
}

func (h *UserHandler) ForgotPassword(c *fiber.Ctx) error {
	var dto forgotPasswordDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	var user models.User
	if err := h.DB.Where("email = ?", dto.Email).First(&user).Error; err != nil {
		// Güvenlik için her zaman başarılı yanıt döndür
		return utils.SuccessResponse(c, fiber.StatusOK, "Şifre sıfırlama talebi alındı", nil)
	}

	// Eski token'ları geçersiz kıl
	h.DB.Where("user_id = ? AND used = false", user.ID).
		Updates(map[string]interface{}{"used": true})

	// Yeni token oluştur
	tokenBytes := make([]byte, 32)
	rand.Read(tokenBytes)
	tokenStr := hex.EncodeToString(tokenBytes)

	resetToken := models.ResetToken{
		UserId:    user.ID,
		Token:     tokenStr,
		ExpiresAt: time.Now().Add(1 * time.Hour),
		Used:      false,
	}

	if err := h.DB.Create(&resetToken).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Token oluşturulamadı")
	}

	// Gerçek e-posta göndermek yerine log'a yaz (aile içi kullanım)
	log.Printf("[RESET PASSWORD] Kullanıcı: %s | Token: %s", user.Email, tokenStr)

	return utils.SuccessResponse(c, fiber.StatusOK, "Şifre sıfırlama token'ı oluşturuldu", fiber.Map{
		"token": tokenStr, // Geliştirme ortamında token response'da döner
	})
}

func (h *UserHandler) ResetPassword(c *fiber.Ctx) error {
	var dto resetPasswordDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	if dto.Token == "" || dto.Password == "" {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Token ve yeni şifre zorunludur")
	}

	var resetToken models.ResetToken
	if err := h.DB.Where("token = ? AND used = false AND expires_at > ?", dto.Token, time.Now()).
		First(&resetToken).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz veya süresi dolmuş token")
	}

	hashedPassword, err := utils.HashPassword(dto.Password)
	if err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Şifre hashlenemedi")
	}

	if err := h.DB.Model(&models.User{}).Where("id = ?", resetToken.UserId).
		Update("password", hashedPassword).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Şifre güncellenemedi")
	}

	h.DB.Model(&resetToken).Update("used", true)

	return utils.SuccessResponse(c, fiber.StatusOK, "Şifre başarıyla sıfırlandı", nil)
}
