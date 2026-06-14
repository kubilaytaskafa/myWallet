package middlewares

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/mywallet/utils"
)

func JWTMiddleware(secretKey string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")

		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer") {
			return fiber.NewError(401, "Unauthorized: Token is required!")
		}

		tokenString := authHeader[7:]

		claims, err := utils.ParseToken(tokenString, secretKey)

		if err != nil {
			return fiber.NewError(401, "Invalid or expired token!")
		}

		c.Locals("user_id", claims.UserID)

		return c.Next()
	}
}
