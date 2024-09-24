package model

import (
	"main/database"

	"gorm.io/gorm"
)

type Tailor struct {
	gorm.Model
	Name  string
	Email string
	Password string
	Address string
	ImgUrl string
	Money int
	OutfitPrices []Outfit `gorm:"many2many:tailor_prices"`
	Products []Product
}

type TailorPrice struct{
	TailorID uint `gorm:"primaryKey"`
	OutfitID uint `gorm:"primaryKey"`
	Price int
}

type TailorRating struct{
	TailorID uint `gorm:"primaryKey"`
	Tailor Tailor
	UserID uint `gorm:"primaryKey"`
	User User
	Rating int
}

type Speciality struct {
	Category string
	Price    int
}

type GetTailorFinal struct {
	ID         int
	Name       string
	Email      string
	Address    string
	ImgUrl     string
	Money 	   int
	Rating     float32
	Speciality []Speciality
}

func GetTailor(id uint) GetTailorFinal{
	type GetTailor struct {
		ID      int
		Name    string
		Email   string
		Address string
		ImgUrl  string
		Rating  float32
		Money	int
	}

	db := database.GetInstance()

	var tailor GetTailor
	var tailorFinal GetTailorFinal

	sql := "SELECT tailors.id, tailors.name, tailors.email, tailors.address, tailors.img_url, round(avg(tailor_ratings.rating), 1) as rating, tailors.money " +
		"FROM tailors " +
		"LEFT JOIN tailor_ratings ON tailor_ratings.tailor_id = tailors.id " +
		"LEFT JOIN tailor_prices ON tailor_prices.tailor_id = tailors.id " +
		"LEFT JOIN outfits ON outfits.id = tailor_prices.outfit_id " +
		"WHERE tailors.id = ? "

	sql += "GROUP BY tailors.id"
	db.Raw(sql, id).Scan(&tailor)

		var specialities []Speciality
		sql = "SELECT outfits.category, tailor_prices.price " +
			"FROM tailor_prices " +
			"JOIN outfits ON outfits.id = tailor_prices.outfit_id " +
			"WHERE tailor_prices.tailor_id = ?"
		db.Raw(sql, tailor.ID).Scan(&specialities)

		tailorFinal = GetTailorFinal{
			ID:         tailor.ID,
			Name:       tailor.Name,
			Address:    tailor.Address,
			Email:      tailor.Email,
			ImgUrl:     tailor.ImgUrl,
			Rating:     tailor.Rating,
			Money: 		tailor.Money,
			Speciality: specialities,
		}

	return tailorFinal
}