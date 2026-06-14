package config

import (
	"log"

	"github.com/mywallet/models"
	"github.com/mywallet/utils"
	"gorm.io/gorm"
)

// SeedAdminUser — SEED_ADMIN_* environment değişkenleri tanımlandığında
// veritabanında o kullanıcı yoksa oluşturur.
// Bu fonksiyon yalnızca ilk kurulum için tasarlanmıştır.
func SeedAdminUser(db *gorm.DB, cfg *AppConfig) {
	if cfg.SeedAdminEmail == "" || cfg.SeedAdminPassword == "" {
		return // Seed değişkenleri tanımlanmamış, atla
	}

	var existing models.User
	if err := db.Where("email = ?", cfg.SeedAdminEmail).First(&existing).Error; err == nil {
		log.Printf("[seed] Admin kullanıcı zaten mevcut: %s", cfg.SeedAdminEmail)
		return
	}

	hashed, err := utils.HashPassword(cfg.SeedAdminPassword)
	if err != nil {
		log.Printf("[seed] HATA: Şifre hashlenemedi: %v", err)
		return
	}

	name := cfg.SeedAdminName
	if name == "" {
		name = "Admin"
	}
	surname := cfg.SeedAdminSurname
	if surname == "" {
		surname = "User"
	}

	user := models.User{
		Name:     name,
		Surname:  surname,
		Email:    cfg.SeedAdminEmail,
		Password: hashed,
	}

	if err := db.Create(&user).Error; err != nil {
		log.Printf("[seed] HATA: Admin kullanıcı oluşturulamadı: %v", err)
		return
	}

	log.Printf("[seed] ✅ Admin kullanıcı oluşturuldu: %s (ID: %d)", cfg.SeedAdminEmail, user.ID)
	log.Println("[seed] ⚠️  Kurulum tamamlandığında SEED_ADMIN_* değişkenlerini .env'den kaldırın!")
}
