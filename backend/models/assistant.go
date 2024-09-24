package model

import (
	"time"

	"gorm.io/gorm"
)

type Assistant struct {
	gorm.Model
	Name  string
}
type AssistantBooking struct {
    gorm.Model
    AssistantID uint
    Assistant   Assistant
    Date        time.Time
    UserID      uint
    User        User
	Address 	string
}
