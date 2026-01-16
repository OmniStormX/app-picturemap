package routes

import (
	user_service "backend/internal/service/userService"
	"backend/utils"
	"log"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(r *gin.Engine) {
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type,Authorization")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}
		c.Next()
	})

	r.POST("/register", user_service.Register)
	r.POST("/login", user_service.Login)
	r.GET("/download", user_service.Download)
	r.Static("/uploads", "./uploads")

	protected := r.Group("/protected")
	protected.Use(JwtAuthMiddleware)
	{
		protected.POST("/list", user_service.GetPictureList)
		protected.POST("/tag/search", user_service.GetListByTag)
		protected.POST("/tag/list", user_service.GetTagList)
		protected.POST("/upload", user_service.Upload)
	}

}

func JwtAuthMiddleware(c *gin.Context) {
	token := c.Request.Header.Get("Authorization")
	log.Println("Received Token:", token)
	if _, err := utils.ParseJwtToken(token); err != nil {
		c.AbortWithStatus(401)
		return
	}
	c.Next()
}
