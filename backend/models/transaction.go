package model

import (
	"time"

	"gorm.io/gorm"
)

type Transaction struct {
	gorm.Model
	TransactionDate time.Time
	UserID          uint
	TailorID        uint
	Products        []Product `gorm:"many2many:tran_products"`
	Requests        []Request `gorm:"many2many:tran_requests"`
	Status          string
	TotalPrice		uint
}
