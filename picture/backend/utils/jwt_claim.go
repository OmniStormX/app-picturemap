package utils

import "github.com/golang-jwt/jwt/v5"

type JwtClaim struct {
	UserId uint `json:"user_id"`
	jwt.RegisteredClaims
}
