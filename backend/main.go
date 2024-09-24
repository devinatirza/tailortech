package main

import (
	"fmt"
	"log"
	"main/controller"
	"net"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func getLocalIP() (string, error) {
	addrs, err := net.InterfaceAddrs()
	if err != nil {
		return "", err
	}

	for _, addr := range addrs {
		if ipnet, ok := addr.(*net.IPNet); ok && !ipnet.IP.IsLoopback() {
			if ipnet.IP.To4() != nil {
				return ipnet.IP.String(), nil
			}
		}
	}
	return "", fmt.Errorf("cannot find local IP address")
}

func main() {
	ip, err := getLocalIP()
	if err != nil {
		log.Fatalf("Error fetching local IP address: %v", err)
	}

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:8081"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	r.GET("/get-server-ip", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"ip": ip})
	})

	r.POST("/register", controller.Register)

	login := r.Group("/login")
	{
		login.POST("/user", controller.LoginHandler)
		login.POST("/tailor", controller.TailorLoginHandler)
	}

	user := r.Group("/users")
	{
		user.GET("/:id", controller.GetUser)
		user.GET("/get-all", controller.GetAllUsers)
		user.POST("/update", controller.UpdateUser)
		user.POST("/topup/:id", controller.TopUpHandler)
	}

	r.GET("/validate", controller.GetUserFromJWT)
	r.GET("/logout", controller.LogoutHandler)

	product := r.Group("/products")
	{
		product.GET("/get-all", controller.GetAllProduct)
		product.GET("/get-tailor-active", controller.GetTailorProducts)
		product.GET("/get-tailor-inactive", controller.GetInactiveTailorProducts)
		product.DELETE("/delete/:id", controller.RemoveProduct)
		product.PUT("/activate/:id", controller.ActivateProduct)
		product.POST("/add", controller.AddProduct)
	}

	tailor := r.Group("/tailors")
	{
		tailor.GET("/:id", controller.GetTailor)
		tailor.GET("/get-all", controller.GetAllTailor)
		tailor.POST("/withdraw/:id", controller.WithdrawalHandler)
	}

	coupon := r.Group("/coupons")
	{
		coupon.POST("/redeem", controller.RedeemCoupon)
		coupon.GET("/code", controller.GetUserCoupons)
		coupon.POST("/exchange", controller.ExchangePointsForCoupon)
	}

	measurements := r.Group("/measurements")
	{
		measurements.POST("/tops", controller.CreateTopMeasurement)
		measurements.POST("/bottoms", controller.CreateBottomMeasurement)
		measurements.POST("/dresses", controller.CreateDressMeasurement)
		measurements.POST("/suits", controller.CreateSuitMeasurement)
		measurements.POST("/totebags", controller.CreateToteBagMeasurement)
	}

	carts := r.Group("/carts")
	{
		carts.POST("/add-to-cart", controller.AddToCart)
		carts.GET("/get-cart/:id", controller.GetCart)
		carts.DELETE("/remove", controller.RemoveFromCart)
	}

	wishlists := r.Group("/wishlists")
	{
		wishlists.POST("/add-to-wishlist", controller.AddToWishlist)
		wishlists.GET("/:userID", controller.GetWishlist)
		wishlists.DELETE("/remove", controller.RemoveFromWishlist)
	}

	requests := r.Group("/requests")
	{
		requests.POST("/create", controller.CreateUserRequest)
		requests.GET("/get-user-request/:id", controller.GetUserRequest)
		requests.GET("/get-tailor-request/:id", controller.GetTailorRequest)
		requests.POST("/update-status", controller.UpdateRequestStatus)
		requests.POST("/confirm-received", controller.HandleRequestReceived)
	}

	r.POST("/payment", controller.ProcessPayment)

	orders := r.Group("/orders")
	{
		orders.POST("/create", controller.CreateProductOrder)
		orders.GET("/get-user-order/:id", controller.GetUserOrder)
		orders.GET("/get-tailor-order/:id", controller.GetTailorOrder)
		orders.POST("/update-status", controller.UpdateOrderStatus)
		orders.POST("/confirm-received", controller.HandleOrderReceived)
	}

	r.POST("/submit-rating", controller.SubmitRating)

	assistants := r.Group("/assistants")
	{
		assistants.GET("/available", controller.GetAvailableAssistants)
		assistants.POST("/booking", controller.BookAssistant)
	}

	r.Run(":8000")
}
