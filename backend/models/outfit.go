package model

import "gorm.io/gorm"

type Outfit struct {
	gorm.Model
	Category  string
}