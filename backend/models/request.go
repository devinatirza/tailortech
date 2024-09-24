package model

import "gorm.io/gorm"

type Request struct {
	gorm.Model
	TailorID    uint
	Tailor      Tailor
	UserID      uint
	Name        string
	Desc        string
	Price       uint
	RequestType uint
	ReqType     Outfit `gorm:"foreignKey:RequestType"`
	Top         Top    `gorm:"foreignKey:RequestID"`
	Bottom      Bottom `gorm:"foreignKey:RequestID"`
	Dress       Dress  `gorm:"foreignKey:RequestID"`
	Suit        Suit   `gorm:"foreignKey:RequestID"`
	ToteBag     ToteBag `gorm:"foreignKey:RequestID"`
}
