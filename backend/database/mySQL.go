package database

import (
	"backend/configs"
	"backend/modal/picture"
	"backend/modal/tag"
	modal_user "backend/modal/user"
	"fmt"
	"log"
	"os"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm/logger"

	"gorm.io/gorm"
)

var (
	DB *gorm.DB
)

// init 初始化数据库连接
func init() {
	err := EnsureDatabaseExists()
	if err != nil {
		panic(err)
	}
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=%s&parseTime=%s&loc=%s",
		configs.EnvMap["MYSQL_USER"],
		configs.EnvMap["MYSQL_PASSWORD"],
		configs.EnvMap["MYSQL_HOST"],
		configs.EnvMap["MYSQL_PORT"],
		configs.EnvMap["MYSQL_DATABASE"],
		configs.EnvMap["MYSQL_CHARSET"],
		configs.EnvMap["MYSQL_PARSETIME"],
		configs.EnvMap["MYSQL_LOC"])

	mysqldb := mysql.Open(dsn)

	sqlDB, err := gorm.Open(mysqldb)
	if err != nil {
		panic("failed to connect database")
	}
	DB = sqlDB
	// 初始化数据库表
	err = initTable()
	if err != nil {
		panic(err)
	}
}

// EnsureDatabaseExists 确保数据库存在
func EnsureDatabaseExists() error {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/?charset=%s&parseTime=%s&loc=%s",
		configs.EnvMap["MYSQL_USER"],
		configs.EnvMap["MYSQL_PASSWORD"],
		configs.EnvMap["MYSQL_HOST"],
		configs.EnvMap["MYSQL_PORT"],
		configs.EnvMap["MYSQL_CHARSET"],
		configs.EnvMap["MYSQL_PARSETIME"],
		configs.EnvMap["MYSQL_LOC"])

	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold:             200 * time.Millisecond, // 慢 SQL 阈值
			LogLevel:                  logger.Warn,            // 慢查询会打印
			IgnoreRecordNotFoundError: true,
			Colorful:                  true,
		},
	)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		return err
	}

	sql := fmt.Sprintf("CREATE DATABASE IF NOT EXISTS %s", configs.EnvMap["MYSQL_DATABASE"])
	err = db.Exec(sql).Error
	if err != nil {
		return err
	}

	return nil
}

// initTable 初始化数据库表
func initTable() error {
	err := DB.AutoMigrate(&modal_user.User{})
	if err != nil {
		return err
	}
	err = DB.AutoMigrate(&picture.Picture{})
	if err != nil {
		return err
	}
	err = DB.AutoMigrate(&tag.Tag{})
	if err != nil {
		return err
	}
	return nil
}
