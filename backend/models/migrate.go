package model

import "main/database"

func Migrate() {
	db := database.GetInstance()
	// db.SetupJoinTable(&Tailor{}, "OutfitPrices", &TailorPrice{})
	// db.SetupJoinTable(&User{}, "Promos", &UserPromo{})
	// db.AutoMigrate(&User{})
	// db.AutoMigrate(&Request{})
	// db.AutoMigrate(&Outfit{})
	// db.AutoMigrate(&Top{})
	// db.AutoMigrate(&Bottom{})
	// db.AutoMigrate(&Suit{})
	// db.AutoMigrate(&ToteBag{})
	// db.AutoMigrate(&Dress{})

	// db.AutoMigrate(&Tailor{})
	// db.AutoMigrate(&Assistant{})
	// db.AutoMigrate(&Transaction{})
	// db.AutoMigrate(&Product{})
	// db.AutoMigrate(&TailorRating{})
	// db.AutoMigrate(&Promo{})
	db.AutoMigrate(&AssistantBooking{})
	
}