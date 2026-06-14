package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/handlers"
	"github.com/mywallet/middlewares"
	"gorm.io/gorm"
)

func SetupIncomeRoutes(router fiber.Router, db *gorm.DB, cfg *config.AppConfig) {
	incomesRoutes := router.Group("/incomes", middlewares.JWTMiddleware(cfg.SecretKey))
	incomeHandler := handlers.NewIncomeHandler(db)

	incomesRoutes.Get("/", incomeHandler.GetAllIncomes)
	incomesRoutes.Get("/:id", incomeHandler.GetIncomeById)
	incomesRoutes.Post("/", incomeHandler.CreateIncome)
	incomesRoutes.Put("/:id", incomeHandler.UpdateIncome)
	incomesRoutes.Delete("/:id", incomeHandler.DeleteIncome)
}
