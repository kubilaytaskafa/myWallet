package models

import (
	"gorm.io/gorm"
)

type User struct {
	ID       uint      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name     string    `json:"name"`
	Surname  string    `json:"surname"`
	Email    string    `json:"email" gorm:"unique;not null"`
	Password string    `json:"password" gorm:"not null"`
	Income   []Income  `json:"income" gorm:"references:ID"`
	Expense  []Expense `json:"expense" gorm:"references:ID"`
	gorm.Model
}

func (User) TableName() string {
	return "users"
}
