package controller

import (
    "fmt"
    "main/database"
    model "main/models"
    "math"
    "net/http"
    "time"

    "github.com/gin-gonic/gin"
)

type CreateRequestInput struct {
    UserID      uint
    Name        string
    Desc        string
    Price       uint
    RequestType string
    TailorID    uint
    Status      string
    TotalPrice  uint
}

func CreateUserRequest(c *gin.Context) {
    db := database.GetInstance()
    var input CreateRequestInput

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    var reqID uint
    db.Raw("select id from outfits where upper(category) like ?", input.RequestType).Scan(&reqID)

    request := model.Request{
        UserID:      input.UserID,
        Name:        input.Name,
        Desc:        input.Desc,
        Price:       input.Price,
        RequestType: reqID,
        TailorID:    input.TailorID,
    }

    if err := db.Create(&request).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    transaction := model.Transaction{
        TransactionDate: time.Now(),
        UserID:          input.UserID,
        TailorID:        input.TailorID,
        Requests:        []model.Request{request},
        Status:          input.Status,
        TotalPrice:      input.TotalPrice,
    }

    if err := db.Create(&transaction).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusCreated, gin.H{"ID": request.ID})
}

func GetUserRequest(c *gin.Context){
    db := database.GetInstance()

    userID := c.Param("id")

    subquery := db.Table("tran_requests").Select("transaction_id").Where("user_id = ?", userID)

    var tran []model.Transaction

    db.Preload("Requests").Where("user_id = ?", userID).Where("id in (?)", subquery).Order("transaction_date desc").Find(&tran)

    c.JSON(http.StatusOK, tran)
}

func GetTailorRequest(c *gin.Context){
    db := database.GetInstance()

    tailorID := c.Param("id")

    var tran []model.Transaction

    subquery := db.Table("tran_requests").Select("transaction_id").Where("tailor_id = ?", tailorID)

    db.Preload("Requests").Preload("Requests.Top").Preload("Requests.Bottom").Preload("Requests.Dress").Preload("Requests.Suit").Preload("Requests.ToteBag").Where("tailor_id = ?", tailorID).Where("id in (?)", subquery).Order("transaction_date desc").Find(&tran)

    c.JSON(http.StatusOK, tran)
}

func UpdateRequestStatus(c *gin.Context) {
    db := database.GetInstance()

    type UpdateStatusInput struct {
        TransactionID uint   `json:"transactionId" binding:"required"`
        NewStatus     string `json:"newStatus" binding:"required"`
    }

    var input UpdateStatusInput

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var transaction model.Transaction
    if db.Where("id = ?", input.TransactionID).First(&transaction).RowsAffected == 0 {
        c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
        return
    }

    transaction.Status = input.NewStatus

    if err := db.Save(&transaction).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Status updated successfully"})
}

func HandleRequestReceived(c *gin.Context) {
    db := database.GetInstance()

    var input ConfirmReceivedRequest
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    var transaction model.Transaction
    if err := db.Preload("Products").Preload("Requests").First(&transaction, input.TransactionID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Transaction not found"})
        return
    }

    if transaction.Status == "Finished" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Transaction already marked as finished"})
        return
    }

    productAmount := 0.0
    requestAmount := 0.0
    pointsAwarded := 0

    for _, request := range transaction.Requests {
        var tailorPrice model.TailorPrice
        if err := db.Where("tailor_id = ? AND outfit_id = ?", transaction.TailorID, request.RequestType).First(&tailorPrice).Error; err != nil {
            c.JSON(http.StatusNotFound, gin.H{"error": "Tailor price not found for request"})
            return
        }
        requestAmount += float64(tailorPrice.Price)
        pointsAwarded += int(tailorPrice.Price) / 15 
    }

    feePercentage := 0.05
    tailorTechFee := (productAmount + requestAmount) * feePercentage
    tailorAmount := (productAmount + requestAmount) - tailorTechFee

    tailorAmount = math.Ceil(tailorAmount)

    var tailor model.Tailor
    if err := db.First(&tailor, transaction.TailorID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Tailor not found"})
        return
    }
    tailor.Money += int(tailorAmount)
    if err := db.Save(&tailor).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update tailor balance"})
        return
    }

    var user model.User
    if err := db.First(&user, transaction.UserID).Error; err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
        return
    }
    user.Points += pointsAwarded
    if err := db.Save(&user).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user points"})
        return
    }

    transaction.Status = "Finished"
    if err := db.Save(&transaction).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update transaction status"})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Transaction marked as finished, tailor's balance updated, and user points awarded"})
}

