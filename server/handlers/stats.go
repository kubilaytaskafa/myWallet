package handlers

import (
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

type StatsHandler struct {
	DB *gorm.DB
}

func NewStatsHandler(db *gorm.DB) *StatsHandler {
	return &StatsHandler{DB: db}
}

type PeriodSummary struct {
	TotalIncome  float64 `json:"total_income"`
	TotalExpense float64 `json:"total_expense"`
	NetBalance   float64 `json:"net_balance"`
}

type SummaryResponse struct {
	Daily   PeriodSummary `json:"daily"`
	Weekly  PeriodSummary `json:"weekly"`
	Monthly PeriodSummary `json:"monthly"`
	Yearly  PeriodSummary `json:"yearly"`
}

type ChartPoint struct {
	Label   string  `json:"label"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
}

func sumIncomes(db *gorm.DB, userID uint, from, to time.Time) float64 {
	var total float64
	db.Model(&models.Income{}).
		Where("user_id = ? AND date >= ? AND date <= ?", userID, from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total
}

func sumExpenses(db *gorm.DB, userID uint, from, to time.Time) float64 {
	var total float64
	db.Model(&models.Expense{}).
		Where("user_id = ? AND date >= ? AND date <= ?", userID, from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total
}

func makeSummary(db *gorm.DB, userID uint, from, to time.Time) PeriodSummary {
	income := sumIncomes(db, userID, from, to)
	expense := sumExpenses(db, userID, from, to)
	return PeriodSummary{
		TotalIncome:  income,
		TotalExpense: expense,
		NetBalance:   income - expense,
	}
}

func (h *StatsHandler) GetSummary(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	now := time.Now()

	// Günlük
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	dayEnd := dayStart.Add(24*time.Hour - time.Second)

	// Haftalık (Pazartesi'den bugüne)
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := now.AddDate(0, 0, -(weekday - 1))
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, now.Location())

	// Aylık
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// Yıllık
	yearStart := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())

	response := SummaryResponse{
		Daily:   makeSummary(h.DB, userID, dayStart, dayEnd),
		Weekly:  makeSummary(h.DB, userID, weekStart, now),
		Monthly: makeSummary(h.DB, userID, monthStart, now),
		Yearly:  makeSummary(h.DB, userID, yearStart, now),
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "İstatistikler", response)
}

// ResidentPeriodSummary — her sakin için dönemlik özet
type ResidentPeriodSummary struct {
	ResidentID uint   `json:"resident_id"`
	Name       string `json:"name"`
	Surname    string `json:"surname"`
	Relation   string `json:"relation"`

	DailyExpense   float64 `json:"daily_expense"`
	WeeklyExpense  float64 `json:"weekly_expense"`
	MonthlyExpense float64 `json:"monthly_expense"`
	YearlyExpense  float64 `json:"yearly_expense"`

	DailyIncome   float64 `json:"daily_income"`
	WeeklyIncome  float64 `json:"weekly_income"`
	MonthlyIncome float64 `json:"monthly_income"`
	YearlyIncome  float64 `json:"yearly_income"`
}

func sumExpensesByResident(db *gorm.DB, userID, residentID uint, from, to time.Time) float64 {
	var total float64
	db.Model(&models.Expense{}).
		Where("user_id = ? AND resident_id = ? AND date >= ? AND date <= ?", userID, residentID, from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total
}

func sumIncomesByResident(db *gorm.DB, userID, residentID uint, from, to time.Time) float64 {
	var total float64
	db.Model(&models.Income{}).
		Where("user_id = ? AND resident_id = ? AND date >= ? AND date <= ?", userID, residentID, from, to).
		Select("COALESCE(SUM(amount), 0)").
		Scan(&total)
	return total
}

func (h *StatsHandler) GetResidentSummary(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	now := time.Now()

	// Günlük
	dayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	dayEnd := dayStart.Add(24*time.Hour - time.Second)

	// Haftalık (Pazartesi'den bugüne)
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := now.AddDate(0, 0, -(weekday - 1))
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, now.Location())

	// Aylık
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	// Yıllık
	yearStart := time.Date(now.Year(), 1, 1, 0, 0, 0, 0, now.Location())

	var residents []models.Resident
	if err := h.DB.Where("user_id = ? AND is_active = true", userID).Find(&residents).Error; err != nil {
		return utils.FailResponse(c, fiber.StatusInternalServerError, "Sakinler alınamadı")
	}

	result := make([]ResidentPeriodSummary, 0, len(residents))
	for _, r := range residents {
		summary := ResidentPeriodSummary{
			ResidentID: r.ID,
			Name:       r.Name,
			Surname:    r.Surname,
			Relation:   r.Relation,

			DailyExpense:   sumExpensesByResident(h.DB, userID, r.ID, dayStart, dayEnd),
			WeeklyExpense:  sumExpensesByResident(h.DB, userID, r.ID, weekStart, now),
			MonthlyExpense: sumExpensesByResident(h.DB, userID, r.ID, monthStart, now),
			YearlyExpense:  sumExpensesByResident(h.DB, userID, r.ID, yearStart, now),

			DailyIncome:   sumIncomesByResident(h.DB, userID, r.ID, dayStart, dayEnd),
			WeeklyIncome:  sumIncomesByResident(h.DB, userID, r.ID, weekStart, now),
			MonthlyIncome: sumIncomesByResident(h.DB, userID, r.ID, monthStart, now),
			YearlyIncome:  sumIncomesByResident(h.DB, userID, r.ID, yearStart, now),
		}
		result = append(result, summary)
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Sakin istatistikleri", result)
}

func (h *StatsHandler) GetChart(c *fiber.Ctx) error {
	userID := c.Locals("user_id").(uint)
	period := c.Query("period", "monthly") // daily | weekly | monthly | yearly
	now := time.Now()

	var points []ChartPoint

	switch period {
	case "daily":
		// Son 7 günün her biri
		for i := 6; i >= 0; i-- {
			d := now.AddDate(0, 0, -i)
			from := time.Date(d.Year(), d.Month(), d.Day(), 0, 0, 0, 0, now.Location())
			to := from.Add(24*time.Hour - time.Second)
			points = append(points, ChartPoint{
				Label:   from.Format("02 Jan"),
				Income:  sumIncomes(h.DB, userID, from, to),
				Expense: sumExpenses(h.DB, userID, from, to),
			})
		}

	case "weekly":
		// Son 8 hafta
		for i := 7; i >= 0; i-- {
			weekEnd := now.AddDate(0, 0, -i*7)
			weekStart := weekEnd.AddDate(0, 0, -6)
			from := time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, now.Location())
			to := time.Date(weekEnd.Year(), weekEnd.Month(), weekEnd.Day(), 23, 59, 59, 0, now.Location())
			points = append(points, ChartPoint{
				Label:   from.Format("02 Jan") + " - " + to.Format("02 Jan"),
				Income:  sumIncomes(h.DB, userID, from, to),
				Expense: sumExpenses(h.DB, userID, from, to),
			})
		}

	case "monthly":
		// Son 12 ay
		for i := 11; i >= 0; i-- {
			t := now.AddDate(0, -i, 0)
			from := time.Date(t.Year(), t.Month(), 1, 0, 0, 0, 0, now.Location())
			to := from.AddDate(0, 1, 0).Add(-time.Second)
			points = append(points, ChartPoint{
				Label:   from.Format("Jan 2006"),
				Income:  sumIncomes(h.DB, userID, from, to),
				Expense: sumExpenses(h.DB, userID, from, to),
			})
		}

	case "yearly":
		// Son 5 yıl
		for i := 4; i >= 0; i-- {
			year := now.Year() - i
			from := time.Date(year, 1, 1, 0, 0, 0, 0, now.Location())
			to := time.Date(year, 12, 31, 23, 59, 59, 0, now.Location())
			points = append(points, ChartPoint{
				Label:   from.Format("2006"),
				Income:  sumIncomes(h.DB, userID, from, to),
				Expense: sumExpenses(h.DB, userID, from, to),
			})
		}

	default:
		return utils.FailResponse(c, fiber.StatusBadRequest, "Geçersiz period (daily|weekly|monthly|yearly)")
	}

	return utils.SuccessResponse(c, fiber.StatusOK, "Grafik verisi", points)
}
