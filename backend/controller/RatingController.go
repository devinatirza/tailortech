package controller

import (
	"main/database"
	model "main/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type RatingInput struct {
	TransactionID uint `json:"transactionId" binding:"required"`
	Rating        int  `json:"rating" binding:"required,min=1,max=5"`
}

func SubmitRating(c *gin.Context) {
	var input RatingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := database.GetInstance()

	var transaction model.Transaction
	if err := db.First(&transaction, input.TransactionID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
		return
	}

	if transaction.Status != "Finished" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Transaction is not finished"})
		return
	}

	tailorRating := model.TailorRating{
		TailorID: transaction.TailorID,
		UserID:   transaction.UserID,
		Rating:   input.Rating,
	}

	if err := db.Create(&tailorRating).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to submit rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Rating submitted successfully"})
}
