package controller

import (
	"main/database"
	model "main/models"
	"net/http"
	"regexp"
	"strings"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

func Register(c *gin.Context) {
	db := database.GetInstance()
	type RegisterInput struct {
		Name        string
		Email       string
		Password    string
		Confirm     string
		PhoneNumber string
		Address     string
	}

	var input RegisterInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if len(input.Name) < 5 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must be more than 5 characters"})
		return
	}

	regex := regexp.MustCompile(`^[a-zA-Z\\s]+$`)
	if !regex.MatchString(input.Name) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Name must not contain symbols or numbers"})
		return
	}

	if !model.IsValidEmail(input.Email) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Please provide a valid email address"})
		return
	}

	var query model.User
	if db.Where("email = ?", input.Email).Find(&query).RowsAffected != 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "This email has been registered"})
		return
	}

	if input.Password != input.Confirm {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Password doesn't match"})
		return
	}

	var passwordChecks []string

	if len(input.Password) < 8 {
		passwordChecks = append(passwordChecks, "Password must be at least 8 characters long")
	}

	if !containsUppercase(input.Password) {
		passwordChecks = append(passwordChecks, "Password must contain at least one uppercase letter")
	}

	if !containsLowercase(input.Password) {
		passwordChecks = append(passwordChecks, "Password must contain at least one lowercase letter")
	}

	if !containsDigit(input.Password) {
		passwordChecks = append(passwordChecks, "Password must contain at least one digit")
	}

	if !containsSpecialChar(input.Password) {
		passwordChecks = append(passwordChecks, "Password must contain at least one special character")
	}

	if len(passwordChecks) > 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": strings.Join(passwordChecks, ", ")})
		return
	}

	if len(input.PhoneNumber) < 10 || len(input.PhoneNumber) > 13 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Phone number must be between 10 and 13 digits long"})
		return
	}

	
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(input.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Could not hash password"})
		return
	}

	insert := model.User{
		Name:        input.Name,
		Email:       input.Email,
		Password:    string(hashedPassword),
		PhoneNumber: input.PhoneNumber,
		Address:     input.Address,
	}
	db.Create(&insert)

	c.JSON(http.StatusOK, gin.H{"message": "You have successfully registered!"})
}

func containsUppercase(s string) bool {
	for _, char := range s {
		if 'A' <= char && char <= 'Z' {
			return true
		}
	}
	return false
}

func containsLowercase(s string) bool {
	for _, char := range s {
		if 'a' <= char && char <= 'z' {
			return true
		}
	}
	return false
}

func containsDigit(s string) bool {
	for _, char := range s {
		if '0' <= char && char <= '9' {
			return true
		}
	}
	return false
}

func containsSpecialChar(s string) bool {
	specialChars := "~`!@#$%^&*()-_=+[{]}\\|;:'\",<.>/?"
	for _, char := range s {
		if strings.ContainsRune(specialChars, char) {
			return true
		}
	}
	return false
}
