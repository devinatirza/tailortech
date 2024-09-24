package controller

import (
	"log"
	"main/database"
	models "main/models"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func GetUser(c *gin.Context) {
	db := database.GetInstance()
	userID := c.Param("id")

	var user models.User
	if err := db.First(&user, userID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func GetAllUsers(c *gin.Context) {
	db := database.GetInstance()

	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch users"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

type TopUpInput struct {
	Amount int `json:"amount"`
}
   
func TopUpHandler(c *gin.Context) {
	db := database.GetInstance()
   
	userID := c.Param("id")
   
	var input TopUpInput
	var user models.User
   
	if err := c.ShouldBindJSON(&input); err != nil {
	 	c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
	 	return
	}
   
	if err := db.First(&user, userID).Error; err != nil {
	 	c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
	 	return
	}
   
	user.Money += input.Amount
   
	if err := db.Save(&user).Error; err != nil {
	 	c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update balance"})
	 	return
	}

	c.JSON(http.StatusOK, gin.H{"user": user})
}

func UpdateUser(c *gin.Context) {
	db := database.GetInstance()
	type UpdateProfileInput struct {
		UserID      uint   `json:"userId" binding:"required"`
		Name        string `json:"name,omitempty"`
		Email       string `json:"email,omitempty"`
		OldPassword string `json:"oldPassword,omitempty"`
		NewPassword string `json:"newPassword,omitempty"`
		Confirm     string `json:"confirmPassword,omitempty"`
		PhoneNumber string `json:"phoneNumber,omitempty"`
		Address     string `json:"address,omitempty"`
		Points      int    `json:"points,omitempty"`
	}

	var input UpdateProfileInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user models.User
	if db.Where("id = ?", input.UserID).First(&user).RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	if input.Name != "" {
		if len(input.Name) < 5 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be more than 5 characters"})
			return
		}

		regex := regexp.MustCompile(`^[a-zA-Z\s]+$`)
		if !regex.MatchString(input.Name) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Name must not contain symbols or numbers"})
			return
		}
		user.Name = input.Name
	}

	if input.Email != "" {
		if !models.IsValidEmail(input.Email) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid email address"})
			return
		}

		var query models.User
		if db.Where("email = ?", input.Email).Not("id = ?", input.UserID).First(&query).RowsAffected != 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "This email has been registered"})
			return
		}
		user.Email = input.Email
	}

	if input.NewPassword != "" {
		if input.NewPassword != input.Confirm {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Passwords do not match"})
			return
		}

		if bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(input.OldPassword)) != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Old password is incorrect"})
			return
		}

		var passwordChecks []string

		if len(input.NewPassword) < 8 {
			passwordChecks = append(passwordChecks, "Password must be at least 8 characters long")
		}

		if !containsUppercase(input.NewPassword) {
			passwordChecks = append(passwordChecks, "Password must contain at least one uppercase letter")
		}

		if !containsLowercase(input.NewPassword) {
			passwordChecks = append(passwordChecks, "Password must contain at least one lowercase letter")
		}

		if !containsDigit(input.NewPassword) {
			passwordChecks = append(passwordChecks, "Password must contain at least one digit")
		}

		if !containsSpecialChar(input.NewPassword) {
			passwordChecks = append(passwordChecks, "Password must contain at least one special character")
		}

		if len(passwordChecks) > 0 {
			c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(passwordChecks, ", ")})
			return
		}

		hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.NewPassword), bcrypt.DefaultCost)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
			return
		}
		user.Password = string(hashedPassword)
	}

	if input.PhoneNumber != "" {
		if len(input.PhoneNumber) < 10 || len(input.PhoneNumber) > 13 {
			c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number must be between 10 and 13 digits long"})
			return
		}
		user.PhoneNumber = input.PhoneNumber
	}

	if input.Address != "" {
		user.Address = input.Address
	}

	if input.Points != 0 {
		user.Points = input.Points
	}

	if err := db.Save(&user).Error; err != nil {
		log.Printf("Failed to update user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully!", "user": user})
}
