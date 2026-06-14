package models

import (
	"time"

	"gorm.io/gorm"
)

type Resident struct {
	ID        uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name      string    `json:"name" gorm:"not null"`
	Surname   string    `json:"surname" gorm:"not null"`
	Relation  string    `json:"relation" gorm:"not null;default:'Diğer'"` // eş, çocuk, ebeveyn, diğer
	BirthDate time.Time `json:"birth_date"`
	IsActive  bool      `json:"is_active" gorm:"default:true"`
	UserId    uint      `json:"user_id" gorm:"not null"`
	gorm.Model
}

func (Resident) TableName() string {
	return "residents"
}
