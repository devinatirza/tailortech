package model

import (
	"regexp"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	Name  string
	Email string
	PhoneNumber string
	Password string
	Address string
	Transactions []Transaction
	Cart []Product `gorm:"many2many:carts"`
	Wishlist []Product `gorm:"many2many:wishlists"`
	Points int
	Promos []Promo `gorm:"many2many:user_promos;references:PromoCode;joinReferences:PromoCode"`
	Money int
}

func (user *User) SetPassword(password string) error {
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return err
	}
	user.Password = string(hashedPassword)
	return nil
}

func IsValidEmail(email string) bool {
	emailRegex := regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$`)
	return emailRegex.MatchString(email)
}
