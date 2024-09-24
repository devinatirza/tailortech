package controller

import (
    "main/database"
    models "main/models"
    "net/http"
    "strconv"

    "github.com/gin-gonic/gin"
)

type Wishlist struct {
    ID        int `gorm:"primary_key"`
    UserID    int `json:"user_id"`
    ProductID int `json:"product_id"`
}

func AddToWishlist(c *gin.Context) {
    db := database.GetInstance()

    var input Wishlist
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    println("AddToWishlist - UserID:", input.UserID, "ProductID:", input.ProductID)

    if input.UserID == 0 || input.ProductID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id or product_id"})
        return
    }

    var user models.User
    if err := db.Where("id = ?", input.UserID).First(&user).Error; err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
        return
    }

    if err := db.Create(&input).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Product added to wishlist successfully"})
}

func GetWishlist(c *gin.Context) {
    type GetProduct struct {
        ID      int
        Product string
        Tailor  string
        Desc    string
        Price   int
        ImgUrl  string
        Size    string
    }
    db := database.GetInstance()

    userIDStr := c.Param("userID")
    if userIDStr == "" {
        c.JSON(http.StatusBadRequest, gin.H{"error": "userID parameter is required"})
        return
    }

    userID, err := strconv.Atoi(userIDStr)
    if err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid userID parameter"})
        return
    }

    var products []GetProduct
    sql := "SELECT products.id, products.name as product, tailors.name as tailor, `desc`, products.price, products.img_url, products.size " +
        "FROM products " +
        "LEFT JOIN tailors ON products.tailor_id = tailors.id " +
        "JOIN wishlists ON products.id = wishlists.product_id " +
        "WHERE wishlists.user_id = ? " +
        "GROUP BY products.id"

    if err := db.Raw(sql, userID).Scan(&products).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, products)
}

func RemoveFromWishlist(c *gin.Context) {
    db := database.GetInstance()

    var input Wishlist
    if err := c.ShouldBindJSON(&input); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    if input.UserID == 0 || input.ProductID == 0 {
        c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user_id or product_id"})
        return
    }

    if err := db.Where("user_id = ? AND product_id = ?", input.UserID, input.ProductID).Delete(&Wishlist{}).Error; err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }

    c.JSON(http.StatusOK, gin.H{"message": "Product removed from wishlist successfully"})
}

