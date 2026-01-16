package database

import (
	"fmt"
	"log"

	"github.com/Aebroyx/sass-api/internal/domain/models"
	"gorm.io/gorm"
)

// RunMigrations runs all database migrations in the correct order
// Models are migrated in dependency order to ensure foreign keys are created properly
func RunMigrations(db *gorm.DB) error {
	log.Println("Running database migrations...")

	// Define all models in the correct order for migration
	// Order matters due to foreign key dependencies:
	// 1. Role - no dependencies
	// 2. Menu - self-referential (parent_id)
	// 3. Users - depends on Role
	// 4. RoleMenu - depends on Role, Menu
	// 5. UserMenu - depends on Users, Menu
	// 6. RightsAccess - depends on Users, Menu
	modelsToMigrate := []interface{}{
		&models.Role{},
		&models.Menu{},
		&models.Users{},
		&models.RoleMenu{},
		&models.UserMenu{},
		&models.RightsAccess{},
	}

	// Run auto-migration for all models
	if err := db.AutoMigrate(modelsToMigrate...); err != nil {
		return fmt.Errorf("auto-migration failed: %w", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// AddModel is a helper function to add new models to migration
// Usage: Call this in RunMigrations when adding new models
// Example:
//   modelsToMigrate := []interface{}{
//       &models.Role{},
//       &models.Menu{},
//       &models.Users{},
//       &models.NewModel{}, // Add new models here
//   }
