package handlers

import (
	"strconv"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

type ExpenseHandler struct {
	DB *gorm.DB
}

func NewExpenseHandler(db *gorm.DB) *ExpenseHandler {
	return &ExpenseHandler{DB: db}
}

type expenseDTO struct {
	Title       string  `json:"title"`
	Amount      float64 `json:"amount"`
	Description string  `json:"description"`
	Category    string  `json:"category"`
	Date        string  `json:"date"`
	ResidentId  *uint   `json:"resident_id"`
}

func (h *ExpenseHandler) GetAllExpenses(c *fiber.Ctx) error {
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

	var expenses []models.Expense
	if err := query.Preload("Resident").Order("date desc").Find(&expenses).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Giderler alınamadı")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Giderler listelendi", expenses)
}

func (h *ExpenseHandler) GetExpenseById(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var expense models.Expense
	if err := h.DB.Preload("Resident").Where("id = ? AND user_id = ?", id, userID).First(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gider bulunamadı")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Gider bulundu", expense)
}

func (h *ExpenseHandler) CreateExpense(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	var dto expenseDTO
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
	expense := models.Expense{
		Title:       dto.Title,
		Amount:      dto.Amount,
		Description: dto.Description,
		Category:    dto.Category,
		Date:        date,
		UserId:      userID,
		ResidentId:  dto.ResidentId,
	}
	if err := h.DB.Create(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gider oluşturulamadı")
	}
	h.DB.Preload("Resident").First(&expense, expense.ID)
	return utils.SuccessResponse(c, fiber.StatusCreated, "Gider oluşturuldu", expense)
}

func (h *ExpenseHandler) UpdateExpense(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var expense models.Expense
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gider bulunamadı")
	}
	var dto expenseDTO
	if err := c.BodyParser(&dto); err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz istek gövdesi")
	}
	if dto.Title != "" {
		expense.Title = dto.Title
	}
	if dto.Amount > 0 {
		expense.Amount = dto.Amount
	}
	if dto.Description != "" {
		expense.Description = dto.Description
	}
	if dto.Category != "" {
		expense.Category = dto.Category
	}
	if dto.Date != "" {
		if t, e := time.Parse("2006-01-02", dto.Date); e == nil {
			expense.Date = t
		}
	}
	expense.ResidentId = dto.ResidentId
	if err := h.DB.Save(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gider güncellenemedi")
	}
	h.DB.Preload("Resident").First(&expense, expense.ID)
	return utils.SuccessResponse(c, fiber.StatusOK, "Gider güncellendi", expense)
}

func (h *ExpenseHandler) DeleteExpense(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	id, err := strconv.Atoi(c.Params("id"))
	if err != nil {
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz ID")
	}
	var expense models.Expense
	if err := h.DB.Where("id = ? AND user_id = ?", id, userID).First(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusNotFound, "Gider bulunamadı")
	}
	if err := h.DB.Delete(&expense).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Gider silinemedi")
	}
	return utils.SuccessResponse(c, fiber.StatusOK, "Gider silindi", nil)
}
