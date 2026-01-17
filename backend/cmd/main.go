package main

import (
	"backend/configs"
	"backend/internal/service/routes"
	"log"

	"github.com/gin-gonic/gin"
)

func init() {
	log.SetFlags(log.Llongfile)
}

func main() {
	r := gin.Default()

	routes.RegisterRoutes(r)
	r.Run(`:` + configs.EnvMap["PORT"])
}
