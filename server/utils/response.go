package utils

import (
	"github.com/gofiber/fiber/v2"
)

type APIResponse struct {
	Success bool        `json:"status"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

func SuccessResponse(c *fiber.Ctx, statusCode int, message string, data interface{}) error {

	return c.Status(statusCode).JSON(APIResponse{
		Success: true,
		Message: message,
		Data:    data,
	})
}

func FailResponse(c *fiber.Ctx, statusCode int, message string) error {

	return c.Status(statusCode).JSON(APIResponse{
		Success: false,
		Message: message,
		Data:    nil,
	})
}
