package database

import (
	"fmt"
	"log"

	"github.com/Aebroyx/sass-api/internal/domain/models"
	"gorm.io/gorm"
)

// RunSeeders runs all database seeders
// Note: Default roles are now seeded during migration (see migration.go)
// This function is available for additional seeding operations
func RunSeeders(db *gorm.DB) error {
	log.Println("Running additional database seeders...")

	// Optional: Seed default menus
	// Uncomment if you want to seed default menus on startup
	// if err := SeedDefaultMenus(db); err != nil {
	// 	log.Printf("Warning: Failed to seed default menus: %v", err)
	// }

	log.Println("Database seeders completed successfully")
	return nil
}

// SeedDefaultMenus seeds default menu items (optional - call manually if needed)
func SeedDefaultMenus(db *gorm.DB) error {
	defaultMenus := []models.Menu{
		{
			Name:       "Dashboard",
			Path:       "/dashboard",
			Icon:       "dashboard",
			OrderIndex: 1,
			IsActive:   true,
		},
		{
			Name:       "Users",
			Path:       "/users",
			Icon:       "users",
			OrderIndex: 2,
			IsActive:   true,
		},
		{
			Name:       "Roles",
			Path:       "/roles",
			Icon:       "shield",
			OrderIndex: 3,
			IsActive:   true,
		},
		{
			Name:       "Menus",
			Path:       "/menus",
			Icon:       "menu",
			OrderIndex: 4,
			IsActive:   true,
		},
		{
			Name:       "Settings",
			Path:       "/settings",
			Icon:       "settings",
			OrderIndex: 5,
			IsActive:   true,
		},
	}

	for _, menu := range defaultMenus {
		var existing models.Menu
		result := db.Where("path = ?", menu.Path).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&menu).Error; err != nil {
				return fmt.Errorf("failed to create menu %s: %w", menu.Name, err)
			}
			log.Printf("Created default menu: %s", menu.Name)
		}
	}

	return nil
}
