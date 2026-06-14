package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"gorm.io/gorm"
)

func SetupRoutes(app *fiber.App, db *gorm.DB, cfg *config.AppConfig) {

	mainRoutes := app.Group("/api")

	mainRoutes.Get("/healthy", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "healthy",
			"service": "my-wallet-api",
			"version": "1.0.0",
		})
	})

	SetupUserRoutes(mainRoutes, db, cfg)
	SetupResidentRoutes(mainRoutes, db, cfg)
	SetupIncomeRoutes(mainRoutes, db, cfg)
	SetupExpenseRoutes(mainRoutes, db, cfg)
	SetupStatsRoutes(mainRoutes, db, cfg)
}
