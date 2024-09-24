package database

import (
  "gorm.io/driver/mysql"
  "gorm.io/gorm"
)

var db *gorm.DB

func GetInstance() *gorm.DB{
	if db == nil{
		db = connection()
	}
	return db
}

func connection() *gorm.DB{
  dsn := "root:@tcp(127.0.0.1:3306)/tailor_tech?charset=utf8mb4&parseTime=True&loc=Local"
  db, _:= gorm.Open(mysql.Open(dsn), &gorm.Config{})

  return db
}