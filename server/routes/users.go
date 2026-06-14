package routes

import (
	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/config"
	"github.com/mywallet/handlers"
	"github.com/mywallet/middlewares"
	"gorm.io/gorm"
)

func SetupUserRoutes(router fiber.Router, db *gorm.DB, cfg *config.AppConfig) {
	userRoutes := router.Group("/users")
	userHandler := handlers.NewUserHandler(db, cfg)

	userRoutes.Post("/register", userHandler.Register)
	userRoutes.Post("/login", userHandler.Login)
	userRoutes.Post("/forgot-password", userHandler.ForgotPassword)
	userRoutes.Post("/reset-password", userHandler.ResetPassword)

	// Korumalı profil route (gelecekte kullanılabilir)
	protected := userRoutes.Group("/", middlewares.JWTMiddleware(cfg.SecretKey))
	_ = protected
}
