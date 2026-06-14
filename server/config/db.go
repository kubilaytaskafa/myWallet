package config

import (
	"github.com/mywallet/models"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func ConnectDB(cfg *AppConfig) (*gorm.DB, error) {

	gormLogger := logger.Default

	if cfg.AppEnv != "PROD" {
		gormLogger = gormLogger.LogMode(logger.Silent)
	}

	db, err := gorm.Open(mysql.Open(cfg.DBDSN), &gorm.Config{
		Logger: gormLogger,
	})
	if err != nil {
		return nil, err
	}

	migrationErr := db.AutoMigrate(&models.User{}, &models.Resident{}, &models.Income{}, &models.Expense{}, &models.ResetToken{})
	if migrationErr != nil {
		return nil, migrationErr
	}

	return db, nil
}
