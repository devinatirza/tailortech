package controller

import (
	"fmt"
	"main/database"
	models "main/models"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
)

type HomeServiceRequest struct {
	UserID      uint   `json:"UserID"`
	Date        string `json:"Date"`
	Time        string `json:"Time"`
	AssistantID uint   `json:"AssistantID"`
	Address     string `json:"Address"`
}

func GetAvailableAssistants(c *gin.Context) {
	db := database.GetInstance()

	dateParam := c.Query("date")
	date, err := time.Parse("2006-01-02", dateParam)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	var assistants []models.Assistant
	if err := db.Find(&assistants).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch assistants"})
		return
	}

	var bookedAssistantIDs []uint
	db.Model(&models.AssistantBooking{}).Where("date = ?", date).Pluck("assistant_id", &bookedAssistantIDs)

	var availableAssistants []models.Assistant
	for _, assistant := range assistants {
		isBooked := false
		for _, bookedID := range bookedAssistantIDs {
			if assistant.ID == bookedID {
				isBooked = true
				break
			}
		}
		if !isBooked {
			availableAssistants = append(availableAssistants, assistant)
		}
	}

	c.JSON(http.StatusOK, availableAssistants)
}

func BookAssistant(c *gin.Context) {
	db := database.GetInstance()

	var request HomeServiceRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	date, err := time.Parse("2006-01-02", request.Date)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid date format"})
		return
	}

	timeParsed, err := time.Parse("15:04:05", request.Time)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid time format"})
		return
	}

	combinedDateTime := time.Date(date.Year(), date.Month(), date.Day(), timeParsed.Hour(), timeParsed.Minute(), timeParsed.Second(), 0, time.Local)

	fmt.Println(combinedDateTime)
	now := time.Now().UTC()
	if combinedDateTime.Before(now.Add(3 * time.Hour)) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking must be at least 3 hours from now"})
		return
	}

	var count int64
	db.Model(&models.AssistantBooking{}).
		Where("assistant_id = ? AND ? BETWEEN date AND DATE_ADD(date, INTERVAL 4 HOUR)", request.AssistantID, combinedDateTime).
		Count(&count)
	if count > 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "Assistant is not available on the selected date and time"})
		return
	}

	booking := models.AssistantBooking{
		AssistantID: request.AssistantID,
		Date:        combinedDateTime,
		UserID:      request.UserID,
		Address:     request.Address,
	}
	if err := db.Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to book assistant"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Assistant booked successfully"})
}
