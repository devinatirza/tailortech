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

type CreateProductOrderInput struct {
    UserID     uint   
    Name       string 
    ProductIDs []uint 
    Status     string 
    TotalPrice uint  
}

func CreateProductOrder(c *gin.Context) {
    db := database.GetInstance()
    var input CreateProductOrderInput

    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    var products []model.Product
    if err := db.Where("id IN ?", input.ProductIDs).Find(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Products not found"})
        return
    }
    for _, product := range products {
        product.IsActive = false
        db.Exec("delete from carts where user_id = ? and product_id = ?", input.UserID, product.ID)
        if err := db.Save(&product).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    transactions := make(map[uint]*model.Transaction)
    for _, product := range products {
        if transaction, ok := transactions[product.TailorID]; ok {
            transaction.Products = append(transaction.Products, product)
        } else {
            transactions[product.TailorID] = &model.Transaction{
                TransactionDate: time.Now(),
                UserID:          input.UserID,
                TailorID:        product.TailorID,
                Products:        []model.Product{product},
                Status:          input.Status,
                TotalPrice:      input.TotalPrice,
            }
        }
    }

    for _, transaction := range transactions {
        if err := db.Create(transaction).Error; err != nil {
            c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
            return
        }
    }

    c.JSON(http.StatusCreated, gin.H{"message": "Orders created successfully"})
}


func GetUserOrder(c *gin.Context){
    db := database.GetInstance()

    userID := c.Param("id")

    var tran []model.Transaction
    
    subquery := db.Table("tran_products").Select("transaction_id").Where("user_id = ?", userID)

    db.Preload("Products").Where("user_id = ?", userID).Where("id in (?)", subquery).Order("transaction_date desc").Find(&tran)

    c.JSON(http.StatusOK, tran)
}

func GetTailorOrder(c *gin.Context){
    db := database.GetInstance()

    tailorID := c.Param("id")

    var tran []model.Transaction

    subquery := db.Table("tran_products").Select("transaction_id").Where("tailor_id = ?", tailorID)

    db.Preload("Products").Where("tailor_id = ?", tailorID).Where("id in (?)", subquery).Order("transaction_date desc").Find(&tran)

    c.JSON(http.StatusOK, tran)
}

func UpdateOrderStatus(c *gin.Context) {
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

type ConfirmReceivedRequest struct {
    TransactionID uint `json:"transactionId" binding:"required"`
}

func HandleOrderReceived(c *gin.Context) {
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

    for _, product := range transaction.Products {
        productAmount += float64(product.Price)
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
