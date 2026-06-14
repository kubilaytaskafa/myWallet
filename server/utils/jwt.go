package utils

import (
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type JWTClaims struct {
	UserID uint `json:"user_id"`
	jwt.RegisteredClaims
}

func GenerateToken(userID uint, secretKey string) (string, error) {
	claims := JWTClaims{
		UserID: userID,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString([]byte(secretKey))
}

// token doğruluğunu kontrol edenfonksiyon
func ParseToken(tokenString, secretKey string) (*JWTClaims, error) {

	// 1- Token stringini çöz ve doğrula
	token, err := jwt.ParseWithClaims(
		tokenString,
		&JWTClaims{}, // Boş bir JWTClaims zarfı ver, kütüphane doldursun
		func(token *jwt.Token) (interface{}, error) {

			// Güvenlik Kontrolü: Algoritma gerçekten HS256 mi?
			// Yoksa biri "alg: none" diye sahte token üretmeye çalışıyor olabilir!
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}

			// Mührü doğrulama için Secret Key'i ver
			return []byte(secretKey), nil
		},
	)

	if err != nil {
		return nil, err // Süresi dolmuş, imza yanlış vs.
	}

	// 2- Token geçerli mi? İçinden Claims'i al
	claims, ok := token.Claims.(*JWTClaims)
	if !ok || !token.Valid {
		return nil, fmt.Errorf("invalid token claims")
	}

	return claims, nil
}
