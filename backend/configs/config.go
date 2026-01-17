package configs

import (
	"fmt"

	"github.com/joho/godotenv"
)

var EnvMap map[string]string

func init() {

	fmt.Println("Loading environment variables from .env file")
	err := godotenv.Load()
	if err != nil {
		panic(err)
	}

	EnvMap, err = godotenv.Read()
	if err != nil {
		panic(err)
	}
}

func Start() {
	fmt.Println("Config package initialized")
}
