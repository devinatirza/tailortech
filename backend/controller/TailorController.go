package controller

import (
	"fmt"
	"main/database"
	model "main/models"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetAllTailor(c *gin.Context) {
	type Speciality struct {
		Category string
		Price    int
	}

	type GetTailor struct {
		ID      int
		Name    string
		Email   string
		Address string
		ImgUrl  string
		Rating  float32
		Money	int
	}

	type GetTailorFinal struct {
		ID         int
		Name       string
		Email      string
		Address    string
		ImgUrl     string
		Rating     float32
		Money	   int
		Speciality []Speciality
	}

	db := database.GetInstance()

	var tailors []GetTailor
	var tailorFinal []GetTailorFinal
	query := c.Query("query")
	speciality := c.Query("speciality")

	sql := "SELECT tailors.id, tailors.name, tailors.email, tailors.address, tailors.img_url, round(avg(tailor_ratings.rating), 1) as rating, tailors.money " +
		"FROM tailors " +
		"LEFT JOIN tailor_ratings ON tailor_ratings.tailor_id = tailors.id " +
		"LEFT JOIN tailor_prices ON tailor_prices.tailor_id = tailors.id " +
		"LEFT JOIN outfits ON outfits.id = tailor_prices.outfit_id "

	if query != "" || speciality != "" {
		sql += "WHERE "
		if query != "" {
			sql += "LOWER(tailors.name) LIKE ? "
			query = "%" + strings.ToLower(query) + "%"
		}
		if query != "" && speciality != "" {
			sql += "AND "
		}
		if speciality != "" {
			sql += "LOWER(outfits.category) = ? "
			speciality = strings.ToLower(speciality)
		}
	}

	sql += "GROUP BY tailors.id"

	if query != "" && speciality != "" {
		db.Raw(sql, query, speciality).Scan(&tailors)
	} else if query != "" {
		db.Raw(sql, query).Scan(&tailors)
	} else if speciality != "" {
		db.Raw(sql, speciality).Scan(&tailors)
	} else {
		db.Raw(sql).Scan(&tailors)
	}

	for _, tailor := range tailors {
		var specialities []Speciality
		sql = "SELECT outfits.category, tailor_prices.price " +
			"FROM tailor_prices " +
			"JOIN outfits ON outfits.id = tailor_prices.outfit_id " +
			"WHERE tailor_prices.tailor_id = ?"
		db.Raw(sql, tailor.ID).Scan(&specialities)

		tailorFinal = append(tailorFinal, GetTailorFinal{
			ID:         tailor.ID,
			Name:       tailor.Name,
			Address:    tailor.Address,
			Email:      tailor.Email,
			ImgUrl:     tailor.ImgUrl,
			Rating:     tailor.Rating,
			Money: 		tailor.Money,
			Speciality: specialities,
		})
	}

	c.JSON(http.StatusOK, tailorFinal)
}

func GetTailor(c *gin.Context){
	id := c.Param("id")

	tid, _ := strconv.ParseUint(id, 10, 32)

	tailor := model.GetTailor(uint(tid))

	c.JSON(http.StatusOK, tailor)
	
}

type WithdrawAmount struct {
	Amount int 
}

func WithdrawalHandler(c *gin.Context) {
	db := database.GetInstance()
   
	tailorID := c.Param("id")
   
	var input WithdrawAmount
	var tailor model.Tailor
   
	if err := c.ShouldBindJSON(&input); err != nil {
		fmt.Println()
	 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
	 	return
	}
   
	if err := db.First(&tailor, tailorID).Error; err != nil {
	 	c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	 	return
	}
   
	tailor.Money -= input.Amount
   
	if err := db.Save(&tailor).Error; err != nil {
	 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
	 	return
	}

	c.JSON(http.StatusOK, gin.H{"tailor": tailor})
}
