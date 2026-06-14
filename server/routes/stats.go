package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/handlers"
	"github.com/mywallet/middlewares"
	"gorm.io/gorm"
)

func SetupStatsRoutes(router fiber.Router, db *gorm.DB, cfg *config.AppConfig) {
	statsRoutes := router.Group("/stats", middlewares.JWTMiddleware(cfg.SecretKey))
	statsHandler := handlers.NewStatsHandler(db)

	statsRoutes.Get("/summary", statsHandler.GetSummary)
	statsRoutes.Get("/chart", statsHandler.GetChart)
	statsRoutes.Get("/resident-summary", statsHandler.GetResidentSummary)
}
