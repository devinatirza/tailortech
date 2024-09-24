package controller

import (
	"main/database"
	models "main/models"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
)

func GetAllProduct(c *gin.Context) {
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

	var products []GetProduct
	query := c.Query("query")

	sql := "SELECT products.id, products.name as product, tailors.name as tailor, products.desc, products.price, products.img_url, products.size " +
		"FROM products " +
		"LEFT JOIN tailors ON products.tailor_id = tailors.id " +
		"WHERE products.is_active = true "

	if query != "" {
		sql += "AND LOWER(products.name) LIKE ? "
		query = "%" + strings.ToLower(query) + "%"
	}

	sql += "GROUP BY products.id"

	if query != "" {
		db.Raw(sql, query).Scan(&products)
	} else {
		db.Raw(sql).Scan(&products)
	}

	c.JSON(http.StatusOK, products)
}

func GetTailorProducts(c *gin.Context) {
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

	var products []GetProduct
	tailorID := c.Query("tailor_id")

	if tailorID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tailor_id query parameter is required"})
		return
	}

	sql := "SELECT products.id, products.name as product, tailors.name as tailor, products.desc, products.price, products.img_url, products.size " +
		"FROM products " +
		"LEFT JOIN tailors ON products.tailor_id = tailors.id " +
		"WHERE products.tailor_id = ? AND products.is_active = true " +
		"GROUP BY products.id"

	db.Raw(sql, tailorID).Scan(&products)

	c.JSON(http.StatusOK, products)
}

func GetInactiveTailorProducts(c *gin.Context) {
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

	var products []GetProduct
	tailorID := c.Query("tailor_id")

	if tailorID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "tailor_id query parameter is required"})
		return
	}

	sql := "SELECT products.id, products.name as product, tailors.name as tailor, products.desc, products.price, products.img_url, products.size " +
		"FROM products " +
		"LEFT JOIN tailors ON products.tailor_id = tailors.id " +
		"WHERE products.tailor_id = ? AND products.is_active = false " +
		"GROUP BY products.id"

	db.Raw(sql, tailorID).Scan(&products)

	c.JSON(http.StatusOK, products)
}

func RemoveProduct(c *gin.Context) {
	productID := c.Param("id")

	db := database.GetInstance()

	var product models.Product
	if err := db.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	product.IsActive = false
	if err := db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to remove product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product removed successfully"})
}

func ActivateProduct(c *gin.Context) {
	productID := c.Param("id")

	db := database.GetInstance()

	var product models.Product
	if err := db.First(&product, productID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	product.IsActive = true
	if err := db.Save(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to activate product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product activated successfully"})
}

type AddProductRequest struct {
	Name     string `json:"Name" binding:"required"`
	TailorID uint   `json:"TailorID" binding:"required"`
	Desc     string `json:"Desc"`
	Price    int    `json:"Price" binding:"required"`
	Size     string `json:"Size"`
	ImgUrl   string `json:"ImgUrl"`
	IsActive bool   `json:"IsActive"`
}

func AddProduct(c *gin.Context) {
	db := database.GetInstance()

	var request AddProductRequest
	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	product := models.Product{
		Name:     request.Name,
		TailorID: request.TailorID,
		Desc:     request.Desc,
		Price:    request.Price,
		Size:     request.Size,
		ImgUrl:   request.ImgUrl,
		IsActive: request.IsActive,
	}

	if err := db.Create(&product).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to add product"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Product added successfully"})
}