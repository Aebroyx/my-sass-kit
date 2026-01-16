package database

import (
	"fmt"
	"log"

	"github.com/Aebroyx/sass-api/internal/domain/models"
	"gorm.io/gorm"
)

// RunSeeders runs all database seeders
func RunSeeders(db *gorm.DB) error {
	log.Println("Running database seeders...")

	// Seed default roles
	if err := seedDefaultRoles(db); err != nil {
		return fmt.Errorf("failed to seed default roles: %w", err)
	}

	// Migrate existing users to default role (one-time migration for existing data)
	if err := migrateExistingUsersToDefaultRole(db); err != nil {
		log.Printf("Warning: Failed to migrate existing users: %v", err)
	}

	log.Println("Database seeders completed successfully")
	return nil
}

// seedDefaultRoles creates default roles if they don't exist
func seedDefaultRoles(db *gorm.DB) error {
	defaultRoles := []models.Role{
		{
			Name:        "admin",
			DisplayName: "Administrator",
			Description: "Full system access",
			IsDefault:   false,
			IsActive:    true,
		},
		{
			Name:        "user",
			DisplayName: "User",
			Description: "Standard user access",
			IsDefault:   true,
			IsActive:    true,
		},
	}

	for _, role := range defaultRoles {
		var existing models.Role
		result := db.Where("name = ?", role.Name).First(&existing)
		if result.Error == gorm.ErrRecordNotFound {
			if err := db.Create(&role).Error; err != nil {
				return fmt.Errorf("failed to create role %s: %w", role.Name, err)
			}
			log.Printf("Created default role: %s", role.Name)
		}
	}

	return nil
}

// migrateExistingUsersToDefaultRole migrates users with role_id = 0 to default role
func migrateExistingUsersToDefaultRole(db *gorm.DB) error {
	// Get default role
	var defaultRole models.Role
	if err := db.Where("is_default = ?", true).First(&defaultRole).Error; err != nil {
		// Fallback to user role if no default is set
		if err := db.Where("name = ?", "user").First(&defaultRole).Error; err != nil {
			return fmt.Errorf("default role not found: %w", err)
		}
	}

	// Update users with RoleID = 0 (not yet migrated)
	result := db.Model(&models.Users{}).
		Where("role_id = 0 OR role_id IS NULL").
		Update("role_id", defaultRole.ID)

	if result.RowsAffected > 0 {
		log.Printf("Migrated %d users to default role", result.RowsAffected)
	}

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
