package controller

import (
	"log"
	"net/http"
	"main/database"
	models "main/models"

	"github.com/gin-gonic/gin"
)

func ExchangePointsForCoupon(c *gin.Context) {
	db := database.GetInstance()

	type ExchangeCouponInput struct {
		UserID    uint   `json:"userId" binding:"required"`
		PromoCode string `json:"promoCode" binding:"required"`
	}

	var input ExchangeCouponInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if db.Where("id = ?", input.UserID).First(&user).RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	pointsRequired := 0
	switch input.PromoCode {
	case "TECH15":
		pointsRequired = 100
	case "TECH35":
		pointsRequired = 200
	case "TECH75":
		pointsRequired = 500
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon code"})
		return
	}

	if user.Points < pointsRequired {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient points"})
		return
	}

	var userPromo models.UserPromo
	if db.Where("promo_code = ? AND user_id = ?", input.PromoCode, input.UserID).First(&userPromo).RowsAffected == 0 {
		userPromo = models.UserPromo{
			UserID:    input.UserID,
			PromoCode: input.PromoCode,
			Quantity:  1,
		}
		if err := db.Create(&userPromo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create new coupon entry"})
			return
		}
	} else {
		userPromo.Quantity += 1
		if err := db.Save(&userPromo).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update coupon quantity"})
			return
		}
	}

	user.Points -= pointsRequired
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user points"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Coupon exchanged successfully"})
}

func RedeemCoupon(c *gin.Context) {
	db := database.GetInstance()

	type RedeemCouponInput struct {
		UserID    uint   `json:"userId" binding:"required"`
		PromoCode string `json:"promoCode" binding:"required"`
	}

	var input RedeemCouponInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var userPromo models.UserPromo
	if db.Where("promo_code = ? AND user_id = ?", input.PromoCode, input.UserID).First(&userPromo).RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Coupon not found"})
		return
	}

	if userPromo.Quantity <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon quantity exhausted"})
		return
	}

	discount := 0
	switch input.PromoCode {
	case "TECH15":
		discount = 150
	case "TECH35":
		discount = 350
	case "TECH75":
		discount = 750
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid coupon code"})
		return
	}

	userPromo.Quantity -= 1
	if err := db.Save(&userPromo).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update coupon quantity"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"success": true, "message": "Coupon redeemed successfully", "discount": discount})
}

func GetUserCoupons(c *gin.Context) {
	db := database.GetInstance()

	userID := c.Query("userId")
	if userID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User ID is required"})
		return
	}

	var userCoupons []models.UserPromo
	if err := db.Where("user_id = ?", userID).Find(&userCoupons).Error; err != nil {
		log.Printf("Failed to fetch user coupons: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch user coupons"})
		return
	}

	var coupons []map[string]interface{}
	for _, userCoupon := range userCoupons {
		discount := 0
		switch userCoupon.PromoCode {
		case "TECH15":
			discount = 150
		case "TECH35":
			discount = 350
		case "TECH75":
			discount = 750
		}
		coupons = append(coupons, map[string]interface{}{
			"code":     userCoupon.PromoCode,
			"discount": discount,
			"quantity": userCoupon.Quantity,
		})
	}

	c.JSON(http.StatusOK, gin.H{"coupons": coupons})
}
