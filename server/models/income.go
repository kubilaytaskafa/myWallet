package models

import (
	"time"

	"gorm.io/gorm"
)

type Income struct {
	ID          uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Title       string    `json:"title" gorm:"not null"`
	Amount      float64   `json:"amount" gorm:"not null"`
	Description string    `json:"description"`
	Category    string    `json:"category" gorm:"default:'Diğer'"`
	Date        time.Time `json:"date" gorm:"not null"`
	UserId      uint      `json:"user_id" gorm:"not null"`
	User        User      `json:"user,omitempty" gorm:"references:ID"`
	ResidentId  *uint     `json:"resident_id" gorm:"default:null"`
	Resident    *Resident `json:"resident,omitempty" gorm:"references:ID"`
	gorm.Model
}

func (Income) TableName() string {
	return "incomes"
}
