package main

import (
	"backend/configs"
	"backend/internal/service/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()

	routes.RegisterRoutes(r)
	r.Run(`:` + configs.EnvMap["PORT"])
}
