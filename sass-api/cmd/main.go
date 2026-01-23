package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

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

	// Run migrations and seeders (if enabled)
	if err := db.Initialize(cfg); err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize services
	userService := services.NewUserService(db.DB, cfg)
	roleService := services.NewRoleService(db.DB, cfg)
	menuService := services.NewMenuService(db.DB, cfg)
	rightsAccessService := services.NewRightsAccessService(db.DB, cfg)
	searchService := services.NewSearchService(db.DB, cfg)

	// Initialize handlers
	h := &routes.Handlers{
		Auth:         handlers.NewAuthHandler(userService),
		User:         handlers.NewUserHandler(userService),
		Role:         handlers.NewRoleHandler(roleService),
		Menu:         handlers.NewMenuHandler(menuService),
		RightsAccess: handlers.NewRightsAccessHandler(rightsAccessService),
		Search:       handlers.NewSearchHandler(searchService),
	}

	// Setup router
	router := routes.SetupRouter(cfg, db.DB, h)

	// Create HTTP server with graceful shutdown support
	srv := &http.Server{
		Addr:    cfg.GetServerAddr(),
		Handler: router,
	}

	// Start server in a goroutine
	go func() {
		log.Printf("Server starting on %s", cfg.GetServerAddr())
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the server
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	// Give the server 5 seconds to finish handling existing requests
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
}
