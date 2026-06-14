package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

type ResidentHandler struct {
	DB *gorm.DB
}

func NewResidentHandler(db *gorm.DB) *ResidentHandler {
	return &ResidentHandler{DB: db}
}

type residentDTO struct {
	Name      string `json:"name"`
	Surname   string `json:"surname"`
	Relation  string `json:"relation"`
	BirthDate string `json:"birth_date"` // "2006-01-02"
	IsActive  *bool  `json:"is_active"`
}

func (h *ResidentHandler) GetAllResidents(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var residents []models.Resident
	if err := h.DB.Where("user_id = ?", userID).Order("created_at asc").Find(&residents).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Ev sakinleri alınamadı")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Ev sakinleri listelendi", residents)
}

func (h *ResidentHandler) CreateResident(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)

	var dto residentDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	if dto.Name == "" || dto.Surname == "" {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Ad ve soyad zorunludur")
	}

	if dto.Relation == "" {
		dto.Relation = "Diğer"
	}

	resident := models.Resident{
		Name:     dto.Name,
		Surname:  dto.Surname,
		Relation: dto.Relation,
		IsActive: true,
		UserId:   userID,
	}

	if dto.BirthDate != "" {
		bd, err := time.Parse("2006-01-02", dto.BirthDate)
		if err == nil {
			resident.BirthDate = bd
		}
	}

	if dto.IsActive != nil {
		resident.IsActive = *dto.IsActive
	}

	if err := h.DB.Create(&resident).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Ev sakini oluşturulamadı")
	}

	return utils.SuccessResponse(c, fiber.StatusCreated, "Ev sakini oluşturuldu", resident)
}

func (h *ResidentHandler) UpdateResident(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}

	var resident models.Resident
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&resident).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Ev sakini bulunamadı")
	}

	var dto residentDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}

	if dto.Name != "" {
		resident.Name = dto.Name
	}
	if dto.Surname != "" {
		resident.Surname = dto.Surname
	}
	if dto.Relation != "" {
		resident.Relation = dto.Relation
	}
	if dto.BirthDate != "" {
		bd, err := time.Parse("2006-01-02", dto.BirthDate)
		if err == nil {
			resident.BirthDate = bd
		}
	}
	if dto.IsActive != nil {
		resident.IsActive = *dto.IsActive
	}

	if err := h.DB.Save(&resident).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Ev sakini güncellenemedi")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Ev sakini güncellendi", resident)
}

func (h *ResidentHandler) DeleteResident(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}

	var resident models.Resident
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&resident).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Ev sakini bulunamadı")
	}

	if err := h.DB.Delete(&resident).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Ev sakini silinemedi")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Ev sakini silindi", nil)
}
