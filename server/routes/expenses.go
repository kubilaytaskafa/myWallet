package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/handlers"
	"github.com/mywallet/middlewares"
	"gorm.io/gorm"
)

func SetupExpenseRoutes(router fiber.Router, db *gorm.DB, cfg *config.AppConfig) {
	expensesRoutes := router.Group("/expenses", middlewares.JWTMiddleware(cfg.SecretKey))
	expenseHandler := handlers.NewExpenseHandler(db)

	expensesRoutes.Get("/", expenseHandler.GetAllExpenses)
	expensesRoutes.Get("/:id", expenseHandler.GetExpenseById)
	expensesRoutes.Post("/", expenseHandler.CreateExpense)
	expensesRoutes.Put("/:id", expenseHandler.UpdateExpense)
	expensesRoutes.Delete("/:id", expenseHandler.DeleteExpense)
}
