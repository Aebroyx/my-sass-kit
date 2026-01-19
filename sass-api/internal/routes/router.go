package routes

import (
	"log"

	"github.com/Aebroyx/sass-api/internal/config"
	"github.com/Aebroyx/sass-api/internal/handlers"
	"github.com/Aebroyx/sass-api/internal/middleware"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

// Handlers holds all handler instances
type Handlers struct {
	Auth         *handlers.AuthHandler
	User         *handlers.UserHandler
	Role         *handlers.RoleHandler
	Menu         *handlers.MenuHandler
	RightsAccess *handlers.RightsAccessHandler
}

// SetupRouter initializes the Gin router with all routes and middleware
func SetupRouter(cfg *config.Config, db *gorm.DB, h *Handlers) *gin.Engine {
	router := gin.New()

	// Add logger middleware
	router.Use(gin.Logger())

	// Add recovery middleware
	router.Use(gin.Recovery())

	// Add CORS middleware
	router.Use(corsMiddleware(cfg))

	// API group
	api := router.Group("/api")

	// Register public routes
	registerPublicRoutes(api, h)

	// Register protected routes
	protected := api.Group("")
	protected.Use(middleware.Auth(cfg.JWTSecret, db))
	registerProtectedRoutes(protected, h)

	return router
}

// corsMiddleware returns a CORS middleware handler
func corsMiddleware(cfg *config.Config) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Log incoming request
		log.Printf("Incoming request: %s %s", c.Request.Method, c.Request.URL.Path)

		// Get allowed origins from config
		allowedOrigin := cfg.CORSAllowedOrigins
		if allowedOrigin == "" {
			allowedOrigin = "http://localhost:3001" // fallback
		}

		// Set CORS headers
		c.Writer.Header().Set("Access-Control-Allow-Origin", allowedOrigin)
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Max-Age", "86400") // 24 hours

		// Handle preflight
		if c.Request.Method == "OPTIONS" {
			log.Printf("Handling OPTIONS request for: %s", c.Request.URL.Path)
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// registerPublicRoutes registers all public routes (no authentication required)
func registerPublicRoutes(router *gin.RouterGroup, h *Handlers) {
	RegisterAuthPublicRoutes(router, h.Auth)
}

// registerProtectedRoutes registers all protected routes (authentication required)
func registerProtectedRoutes(router *gin.RouterGroup, h *Handlers) {
	RegisterAuthProtectedRoutes(router, h.Auth)
	RegisterUserRoutes(router, h.User)
	RegisterRoleRoutes(router, h.Role)
	RegisterMenuRoutes(router, h.Menu)
	RegisterRightsAccessRoutes(router, h.RightsAccess)
}
