package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type AppConfig struct {
	AppName   string
	AppEnv    string
	HTTPPort  string
	DBDSN     string
	SecretKey string

	// CORS
	CORSOrigins string

	// Seed (opsiyonel — ilk admin hesabı)
	SeedAdminEmail    string
	SeedAdminPassword string
	SeedAdminName     string
	SeedAdminSurname  string
}

func LoadConfig() *AppConfig {
	// .env dosyası varsa yükle; yoksa system environment'tan oku (Docker / CI / cloud)
	if err := godotenv.Load(); err != nil {
		log.Println("[config] .env dosyası bulunamadı, system environment variables kullanılıyor")
	}

	return &AppConfig{
		AppName:   requireEnv("APP_NAME"),
		AppEnv:    requireEnv("APP_ENV"),
		HTTPPort:  requireEnv("HTTP_PORT"),
		DBDSN:     requireEnv("DB_DSN"),
		SecretKey: requireEnv("SECRET_KEY"),

		CORSOrigins: getEnvWithDefault("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000"),

		// Seed değişkenleri opsiyonel — boş olabilir
		SeedAdminEmail:    os.Getenv("SEED_ADMIN_EMAIL"),
		SeedAdminPassword: os.Getenv("SEED_ADMIN_PASSWORD"),
		SeedAdminName:     os.Getenv("SEED_ADMIN_NAME"),
		SeedAdminSurname:  os.Getenv("SEED_ADMIN_SURNAME"),
	}
}

// requireEnv — zorunlu değişken yoksa panikler
func requireEnv(key string) string {
	value, ok := os.LookupEnv(key)
	if !ok || value == "" {
		log.Fatalf("[config] HATA: Zorunlu environment variable eksik: %s", key)
	}
	return value
}

// getEnvWithDefault — opsiyonel değişken; yoksa default değeri döner
func getEnvWithDefault(key, defaultValue string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return defaultValue
}
