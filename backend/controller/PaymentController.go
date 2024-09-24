package controller

import (
	"log"
	"net/http"
	"main/database"
	models "main/models"

	"github.com/gin-gonic/gin"
)

type PaymentRequest struct {
	UserID        uint   `json:"userId"`
	TotalAmount   int    `json:"totalAmount"`
	PromoCode     string `json:"promoCode"`
	PaymentMethod string `json:"paymentMethod"`
}

type PaymentResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}

func ProcessPayment(c *gin.Context) {
	db := database.GetInstance()

	var paymentRequest PaymentRequest
	if err := c.ShouldBindJSON(&paymentRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if db.Where("id = ?", paymentRequest.UserID).First(&user).RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if user.Money < paymentRequest.TotalAmount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Insufficient balance to complete the payment"})
		return
	}

	tx := db.Begin()

	user.Money -= paymentRequest.TotalAmount

	if err := tx.Save(&user).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user balance"})
		return
	}

	if paymentRequest.PromoCode != "" {
		var userPromo models.UserPromo
		if err := tx.Where("promo_code = ? AND user_id = ?", paymentRequest.PromoCode, paymentRequest.UserID).First(&userPromo).Error; err != nil {
			tx.Rollback()
			log.Printf("Failed to query user promo: %v", err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query user promo"})
			return
		}

		if userPromo.Quantity > 0 {
			userPromo.Quantity--
			if userPromo.Quantity == 0 {
				if err := tx.Delete(&userPromo).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete promo code"})
					return
				}
			} else {
				if err := tx.Save(&userPromo).Error; err != nil {
					tx.Rollback()
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update promo code quantity"})
					return
				}
			}
		} else {
			tx.Rollback()
			c.JSON(http.StatusBadRequest, gin.H{"error": "Coupon quantity is already zero"})
			return
		}
	}

	if err := tx.Commit().Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to commit transaction"})
		return
	}

	log.Printf("Payment processed successfully for user: %d", paymentRequest.UserID)

	c.JSON(http.StatusOK, PaymentResponse{Success: true, Message: "Payment processed successfully"})
}
