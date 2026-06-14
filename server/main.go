package main

import (
	"log"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/helmet"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/mywallet/config"
	"github.com/mywallet/routes"
)

func main() {
	cfg := config.LoadConfig()

	// Veritabanı bağlantısı
	db, err := config.ConnectDB(cfg)
	if err != nil {
		log.Fatalf("Veritabanına bağlanılamadı: %v", err)
	}

	// İlk kurulum — admin seed (SEED_ADMIN_* env değişkenleri varsa çalışır)
	config.SeedAdminUser(db, cfg)

	app := fiber.New(fiber.Config{
		AppName:      cfg.AppName,
		WriteTimeout: 10 * time.Second,
		ReadTimeout:  10 * time.Second,
		IdleTimeout:  30 * time.Second,
		// Fiber hata mesajlarında stack trace gösterme
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{
				"success": false,
				"message": err.Error(),
			})
		},
	})

	// ─── Global Middleware ────────────────────────────────────────────────────

	// Panic recovery — sunucu çökmesini önler
	app.Use(recover.New())

	// Güvenlik header'ları (XSS, Clickjacking, MIME sniffing önleme vb.)
	app.Use(helmet.New())

	// İstek loglama (production'da daha az verbose olabilir)
	if cfg.AppEnv != "PROD" {
		app.Use(logger.New(logger.Config{
			Format: "[${time}] ${method} ${path} → ${status} (${latency})\n",
		}))
	}

	// Rate limiting — brute force saldırılarına karşı
	app.Use(limiter.New(limiter.Config{
		Max:        100,             // dakikada max 100 istek
		Expiration: 1 * time.Minute,
		LimitReached: func(c *fiber.Ctx) error {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"success": false,
				"message": "Çok fazla istek. Lütfen bir süre bekleyin.",
			})
		},
	}))

	// CORS — izin verilen origin'ler .env'den okunur
	allowedOrigins := strings.TrimSpace(cfg.CORSOrigins)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     allowedOrigins,
		AllowHeaders:     "Origin, Content-Type, Accept, Authorization",
		AllowMethods:     "GET, POST, PUT, DELETE, OPTIONS",
		AllowCredentials: false,
	}))

	// ─── Routes ──────────────────────────────────────────────────────────────
	routes.SetupRoutes(app, db, cfg)

	log.Printf("🚀 %s başlatılıyor — Port: %s (Ortam: %s)", cfg.AppName, cfg.HTTPPort, cfg.AppEnv)
	log.Fatal(app.Listen(":" + cfg.HTTPPort))
}
