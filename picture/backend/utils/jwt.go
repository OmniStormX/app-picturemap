package utils

import (
	"backend/configs"
	"errors"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

func GeneratedJwtToken(userId uint) (string, error) {

	now := time.Now()
	expireTime := time.Now().Add(24 * time.Hour)

	claims := JwtClaim{
		UserId: userId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expireTime),
			NotBefore: jwt.NewNumericDate(now),
			IssuedAt:  jwt.NewNumericDate(now),
			Issuer:    "picturemap",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return token.SignedString([]byte(configs.EnvMap["JWT_SECRET"]))
}

// ParseJwtToken 解析JWT token, 验证token是否有效, 返回token中的claims
func ParseJwtToken(tokenString string) (*JwtClaim, error) {

	token, err := jwt.ParseWithClaims(
		tokenString,
		&JwtClaim{},
		func(token *jwt.Token) (interface{}, error) {
			if token.Method.Alg() != jwt.SigningMethodHS256.Alg() {
				return nil, errors.New("unexpected signing method")
			}
			return []byte(configs.EnvMap["JWT_SECRET"]), nil
		},
	)
	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*JwtClaim); ok && token.Valid {
		return claims, nil
	}
	return nil, errors.New("invalid token")
}

// HashPassword 对密码进行哈希加密
func HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

// CheckPasswordHash 检查密码是否与哈希值匹配
func CheckPasswordHash(password, hash string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
