package main

import (
	"log"

	"github.com/Aebroyx/sass-api/internal/config"
	"github.com/Aebroyx/sass-api/internal/database"
	"github.com/Aebroyx/sass-api/internal/handlers"
	"github.com/Aebroyx/sass-api/internal/routes"
	"github.com/Aebroyx/sass-api/internal/services"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Validate configuration
	if err := cfg.Validate(); err != nil {
		log.Fatalf("Invalid configuration: %v", err)
	}

	// Initialize database connection
	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations and seeders
	if err := db.Initialize(); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize services
	userService := services.NewUserService(db.DB, cfg)
	roleService := services.NewRoleService(db.DB, cfg)
	menuService := services.NewMenuService(db.DB, cfg)
	rightsAccessService := services.NewRightsAccessService(db.DB, cfg)

	// Initialize handlers
	h := &routes.Handlers{
		Auth:         handlers.NewAuthHandler(userService),
		User:         handlers.NewUserHandler(userService),
		Role:         handlers.NewRoleHandler(roleService),
		Menu:         handlers.NewMenuHandler(menuService),
		RightsAccess: handlers.NewRightsAccessHandler(rightsAccessService),
	}

	// Setup router
	router := routes.SetupRouter(cfg, db.DB, h)

	// Start server
	log.Printf("Server starting on %s", cfg.GetServerAddr())
	if err := router.Run(cfg.GetServerAddr()); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
