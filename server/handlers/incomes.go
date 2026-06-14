package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

type IncomeHandler struct {
	DB *gorm.DB
}

func NewIncomeHandler(db *gorm.DB) *IncomeHandler {
	return &IncomeHandler{DB: db}
}

type incomeDTO struct {
	Title       string  `json:"title"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Date        string  `json:"date"`
	ResidentId  *uint   `json:"resident_id"`
}

func (h *IncomeHandler) GetAllIncomes(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	query := h.DB.Where("user_id = ?", userID)

	if s := c.Query("start"); s != "" {
		if t, err := time.Parse("2006-01-02", s); err == nil {
			query = query.Where("date >= ?", t)
		}
	}
	if e := c.Query("end"); e != "" {
		if t, err := time.Parse("2006-01-02", e); err == nil {
			query = query.Where("date <= ?", t.Add(24*time.Hour-time.Second))
		}
	}
	if rid := c.Query("resident_id"); rid != "" {
		query = query.Where("resident_id = ?", rid)
	}

	var incomes []models.Income
	if err := query.Preload("Resident").Order("date desc").Find(&incomes).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gelirler alınamadı")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Gelirler listelendi", incomes)
}

func (h *IncomeHandler) GetIncomeById(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var income models.Income
	if err := h.DB.Preload("Resident").Where("id = ? AND user_id = ?", id, userID).First(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gelir bulunamadı")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Gelir bulundu", income)
}

func (h *IncomeHandler) CreateIncome(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var dto incomeDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}
	if dto.Title == "" || dto.Amount <= 0 || dto.Date == "" {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Başlık, miktar ve tarih zorunludur")
	}
	date, err := time.Parse("2006-01-02", dto.Date)
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz tarih formatı (YYYY-MM-DD)")
	}
	if dto.Category == "" {
		dto.Category = "Diğer"
	}
	income := models.Income{
		Title:       dto.Title,
		Amount:      dto.Amount,
		Description: dto.Description,
		Category:    dto.Category,
		Date:        date,
		UserId:      userID,
		ResidentId:  dto.ResidentId,
	}
	if err := h.DB.Create(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gelir oluşturulamadı")
	}
	h.DB.Preload("Resident").First(&income, income.ID)
	return utils.SuccessResponse(c, fiber.StatusCreated, "Gelir oluşturuldu", income)
}

func (h *IncomeHandler) UpdateIncome(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var income models.Income
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gelir bulunamadı")
	}
	var dto incomeDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}
	if dto.Title != "" {
		income.Title = dto.Title
	}
	if dto.Amount > 0 {
		income.Amount = dto.Amount
	}
	if dto.Description != "" {
		income.Description = dto.Description
	}
	if dto.Category != "" {
		income.Category = dto.Category
	}
	if dto.Date != "" {
		if t, e := time.Parse("2006-01-02", dto.Date); e == nil {
			income.Date = t
		}
	}
	income.ResidentId = dto.ResidentId
	if err := h.DB.Save(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gelir güncellenemedi")
	}
	h.DB.Preload("Resident").First(&income, income.ID)
	return utils.SuccessResponse(c, fiber.StatusOK, "Gelir güncellendi", income)
}

func (h *IncomeHandler) DeleteIncome(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var income models.Income
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gelir bulunamadı")
	}
	if err := h.DB.Delete(&income).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gelir silinemedi")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Gelir silindi", nil)
}
