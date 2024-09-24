package controller

import (
	"main/database"
	"net/http"

	"github.com/gin-gonic/gin"
)

func AddToCart(c *gin.Context) {
	db := database.GetInstance()

	type Cart struct {
		UserID    int
		ProductID int
	}

	var input Cart

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db.Create(&input)
	c.JSON(http.StatusOK, gin.H{"message": "Product added to cart"})
}

func GetCart(c *gin.Context) {
	db := database.GetInstance()
	userID := c.Param("id")

	type CartProduct struct {
		ID         int    `json:"ID"`
		Name       string `json:"Product"`
		Price      int    `json:"Price"`
		Size       string `json:"Size"`
		ImgUrl     string `json:"ImgUrl"`
		TailorName string `json:"Tailor"`
	}

	type Cart struct {
		TotalPrice int          `json:"TotalPrice"`
		Products   []CartProduct `json:"Products"`
	}

	cartProducts := Cart{
		TotalPrice: 0,
	}

	if err := db.Table("products").
		Select("products.id as id, products.name as name, products.price, products.size, products.img_url as img_url, tailors.name as tailor_name").
		Joins("JOIN carts ON carts.product_id = products.id").
		Joins("JOIN tailors ON tailors.id = products.tailor_id").
		Where("carts.user_id = ?", userID).
		Scan(&cartProducts.Products).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get cart items"})
		return
	}

	if len(cartProducts.Products) == 0 {
		c.JSON(http.StatusOK, gin.H{"message": "Your cart is empty"})
		return
	}

	for _, prod := range cartProducts.Products {
		cartProducts.TotalPrice += prod.Price
	}

	c.JSON(http.StatusOK, cartProducts)
}

func RemoveFromCart(c *gin.Context) {
	db := database.GetInstance()

	type Cart struct {
		UserID    int `json:"userId"`
		ProductID int `json:"productId"`
	}

	var input Cart

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := db.Where("user_id = ? AND product_id = ?", input.UserID, input.ProductID).Delete(&Cart{}).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove item from cart"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product removed from cart"})
}
