package models

import (
	"time"

	"gorm.io/gorm"
)

type ResetToken struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	UserId    uint      `json:"user_id" gorm:"not null"`
	Token     string    `json:"token" gorm:"not null;unique"`
	ExpiresAt time.Time `json:"expires_at" gorm:"not null"`
	Used      bool      `json:"used" gorm:"default:false"`
	gorm.Model
}

func (ResetToken) TableName() string {
	return "reset_tokens"
}
