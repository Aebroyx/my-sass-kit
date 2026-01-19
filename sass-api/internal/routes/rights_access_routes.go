package routes

import (
	"github.com/Aebroyx/sass-api/internal/handlers"
	"github.com/gin-gonic/gin"
)

// RegisterRightsAccessRoutes registers permission override routes
func RegisterRightsAccessRoutes(router *gin.RouterGroup, h *handlers.RightsAccessHandler) {
	ra := router.Group("/rights-access")
	{
		// Get all permission overrides for a user
		ra.GET("/user/:userId", h.GetUserRightsAccess)

		// Get specific permission override
		ra.GET("/user/:userId/menu/:menuId", h.GetUserMenuRightsAccess)

		// Create or update permission override
		ra.POST("", h.CreateOrUpdateRightsAccess)

		// Delete permission override
		ra.DELETE("/:id", h.DeleteRightsAccess)
	}
}
