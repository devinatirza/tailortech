package controller

import (
    "main/database"
    model "main/models"
    "net/http"
    "fmt"

    "github.com/gin-gonic/gin"
)

func CreateTopMeasurement(c *gin.Context) {
    db := database.GetInstance()
    var top model.Top

    if err := c.ShouldBindJSON(&top); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    db.Create(&top)
    c.JSON(http.StatusCreated, top)
}

func CreateBottomMeasurement(c *gin.Context) {
    db := database.GetInstance()
    var bottom model.Bottom

    if err := c.ShouldBindJSON(&bottom); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    db.Create(&bottom)
    c.JSON(http.StatusCreated, bottom)
}

func CreateDressMeasurement(c *gin.Context) {
    db := database.GetInstance()
    var dress model.Dress

if err := c.ShouldBindJSON(&dress); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    db.Create(&dress)
    c.JSON(http.StatusCreated, dress)
}

func CreateSuitMeasurement(c *gin.Context) {
    db := database.GetInstance()
    var suit model.Suit

    if err := c.ShouldBindJSON(&suit); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    db.Create(&suit)
    c.JSON(http.StatusCreated, suit)
}

func CreateToteBagMeasurement(c *gin.Context) {
    db := database.GetInstance()
    var toteBag model.ToteBag

    if err := c.ShouldBindJSON(&toteBag); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        fmt.Println("Error binding JSON:", err)
        return
    }

    db.Create(&toteBag)
    c.JSON(http.StatusCreated, toteBag)
}

