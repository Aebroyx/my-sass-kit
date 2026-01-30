package main

import (
	"log"

	"github.com/Aebroyx/sass-api/internal/config"
	"github.com/Aebroyx/sass-api/internal/database"
	"github.com/Aebroyx/sass-api/internal/handlers"
	"github.com/Aebroyx/sass-api/internal/logger"
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

	// Initialize structured logger
	jsonOutput := cfg.Environment == "production"
	logger.Init("sass-api", cfg.LogLevel, jsonOutput)
	logger.Info("Starting SaaS API server...")

	// Initialize database connection
	db, err := database.NewConnection(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Run migrations and seeders (if enabled)
	if err := db.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize services
	tokenService := services.NewTokenService(db.DB, cfg)
	auditService := services.NewAuditService(db.DB)
	rateLimiterService := services.NewRateLimiterService(cfg)
	userService := services.NewUserService(db.DB, cfg, tokenService)
	userImportService := services.NewUserImportService(db.DB)
	roleService := services.NewRoleService(db.DB, cfg)
	roleImportService := services.NewRoleImportService(db.DB)
	menuService := services.NewMenuService(db.DB, cfg)
	menuImportService := services.NewMenuImportService(db.DB)
	rightsAccessService := services.NewRightsAccessService(db.DB, cfg)
	permissionService := services.NewPermissionService(db.DB, cfg, menuService)
	searchService := services.NewSearchService(db.DB, cfg, permissionService)

	// Initialize handlers
	h := &routes.Handlers{
		Auth:         handlers.NewAuthHandler(userService, auditService),
		User:         handlers.NewUserHandler(userService),
		UserImport:   handlers.NewUserImportHandler(userImportService),
		Role:         handlers.NewRoleHandler(roleService),
		RoleImport:   handlers.NewRoleImportHandler(roleImportService),
		Menu:         handlers.NewMenuHandler(menuService),
		MenuImport:   handlers.NewMenuImportHandler(menuImportService),
		RightsAccess: handlers.NewRightsAccessHandler(rightsAccessService),
		Search:       handlers.NewSearchHandler(searchService),
		Token:        handlers.NewTokenHandler(tokenService, userService, cfg, db.DB),
		Audit:        handlers.NewAuditHandler(auditService),
	}

	// Initialize services struct for router
	svc := &routes.Services{
		Permission:  permissionService,
		Audit:       auditService,
		RateLimiter: rateLimiterService,
	}

	// Setup router
	router := routes.SetupRouter(cfg, db.DB, h, svc)

	// Run the server
	log.Printf("Server starting on %s", cfg.GetServerAddr())
	router.Run(cfg.GetServerAddr())
}
