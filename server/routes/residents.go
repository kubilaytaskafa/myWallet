package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/handlers"
	"github.com/mywallet/middlewares"
	"gorm.io/gorm"
)

func SetupResidentRoutes(router fiber.Router, db *gorm.DB, cfg *config.AppConfig) {
	residentsRoutes := router.Group("/residents", middlewares.JWTMiddleware(cfg.SecretKey))
	residentHandler := handlers.NewResidentHandler(db)

	residentsRoutes.Get("/", residentHandler.GetAllResidents)
	residentsRoutes.Post("/", residentHandler.CreateResident)
	residentsRoutes.Put("/:id", residentHandler.UpdateResident)
	residentsRoutes.Delete("/:id", residentHandler.DeleteResident)
}
