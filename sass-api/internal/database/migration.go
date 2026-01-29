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

	// Step 1: Migrate independent tables first (no FK dependencies)
	log.Println("Step 1: Migrating Role and Menu tables...")
	if err := db.AutoMigrate(&models.Role{}, &models.Menu{}); err != nil {
		return fmt.Errorf("failed to migrate Role/Menu: %w", err)
	}

	// Step 2: Seed default roles BEFORE adding FK constraint to users
	log.Println("Step 2: Seeding default roles...")
	if err := seedDefaultRoles(db); err != nil {
		return fmt.Errorf("failed to seed default roles: %w", err)
	}

	// Step 3: Update existing users to have valid role_id
	log.Println("Step 3: Updating existing users with default role...")
	if err := updateExistingUsersRole(db); err != nil {
		log.Printf("Warning: Failed to update existing users: %v", err)
	}

	// Step 4: Now migrate Users table with FK constraint
	log.Println("Step 4: Migrating Users table with foreign key...")
	if err := db.AutoMigrate(&models.Users{}); err != nil {
		return fmt.Errorf("failed to migrate Users: %w", err)
	}

	// Step 5: Migrate pivot/relationship tables
	log.Println("Step 5: Migrating relationship tables...")
	relationshipModels := []interface{}{
		&models.RoleMenu{},
		&models.UserMenu{},
		&models.RightsAccess{},
	}
	if err := db.AutoMigrate(relationshipModels...); err != nil {
		return fmt.Errorf("failed to migrate relationship tables: %w", err)
	}

	// Step 6: Migrate RefreshToken and AuditLog tables
	log.Println("Step 6: Migrating RefreshToken and AuditLog tables...")
	securityModels := []interface{}{
		&models.RefreshToken{},
		&models.AuditLog{},
	}
	if err := db.AutoMigrate(securityModels...); err != nil {
		return fmt.Errorf("failed to migrate security tables: %w", err)
	}

	// Step 7: Seed Audit Logs menu
	log.Println("Step 7: Seeding Audit Logs menu...")
	if err := seedAuditLogsMenu(db); err != nil {
		log.Printf("Warning: Failed to seed Audit Logs menu: %v", err)
	}

	log.Println("Database migrations completed successfully")
	return nil
}

// updateExistingUsersRole updates users with invalid role_id to default role
func updateExistingUsersRole(db *gorm.DB) error {
	// Get default role
	var defaultRole models.Role
	if err := db.Where("is_default = ?", true).First(&defaultRole).Error; err != nil {
		// Fallback to user role if no default is set
		if err := db.Where("name = ?", "user").First(&defaultRole).Error; err != nil {
			return fmt.Errorf("default role not found: %w", err)
		}
	}

	// Update users with invalid RoleID
	result := db.Model(&models.Users{}).
		Where("role_id = 0 OR role_id IS NULL").
		Update("role_id", defaultRole.ID)

	if result.RowsAffected > 0 {
		log.Printf("Updated %d existing users to default role (ID: %d)", result.RowsAffected, defaultRole.ID)
	}

	return nil
}

// seedDefaultRoles creates default roles if they don't exist
func seedDefaultRoles(db *gorm.DB) error {
	defaultRoles := []models.Role{
		{
			Name:        "root",
			DisplayName: "Root",
			Description: "Super administrator with unrestricted access",
			IsDefault:   false,
			IsActive:    true,
		},
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
			log.Printf("Created default role: %s (ID: %d)", role.Name, role.ID)
		} else {
			log.Printf("Role already exists: %s (ID: %d)", existing.Name, existing.ID)
		}
	}

	return nil
}

// seedAuditLogsMenu creates the Audit Logs menu if it doesn't exist
func seedAuditLogsMenu(db *gorm.DB) error {
	// Check if menu already exists
	var existing models.Menu
	result := db.Where("path = ?", "/audit-logs").First(&existing)

	if result.Error == gorm.ErrRecordNotFound {
		// Find Configuration parent menu
		var configMenu models.Menu
		var parentID *uint

		// Try to find Configuration menu by name or path
		err := db.Where("name ILIKE ?", "%configuration%").
			Or("path ILIKE ?", "%configuration%").
			First(&configMenu).Error

		if err == nil {
			parentID = &configMenu.ID
			log.Printf("Found Configuration menu (ID: %d), will create Audit Logs as child", configMenu.ID)
		} else {
			log.Printf("Configuration menu not found, creating Audit Logs as top-level menu")
		}

		// Create Audit Logs menu
		menu := models.Menu{
			Name:       "Audit Logs",
			Path:       "/audit-logs",
			Icon:       "clipboard",
			OrderIndex: 100,
			ParentID:   parentID,
			IsActive:   true,
		}

		if err := db.Create(&menu).Error; err != nil {
			return fmt.Errorf("failed to create Audit Logs menu: %w", err)
		}

		if parentID != nil {
			log.Printf("Created Audit Logs menu (ID: %d) under Configuration menu (ID: %d)", menu.ID, *parentID)
		} else {
			log.Printf("Created Audit Logs menu (ID: %d) as top-level menu", menu.ID)
		}

		// Grant read permission to admin and root roles
		var adminRole models.Role
		if err := db.Where("name = ?", "admin").First(&adminRole).Error; err == nil {
			roleMenu := models.RoleMenu{
				RoleID:    adminRole.ID,
				MenuID:    menu.ID,
				CanRead:   true,
				CanWrite:  false,
				CanUpdate: false,
				CanDelete: false,
			}
			if err := db.Create(&roleMenu).Error; err != nil {
				log.Printf("Warning: Failed to grant admin permission to Audit Logs: %v", err)
			} else {
				log.Printf("Granted admin role read permission to Audit Logs menu")
			}
		}

		var rootRole models.Role
		if err := db.Where("name = ?", "root").First(&rootRole).Error; err == nil {
			roleMenu := models.RoleMenu{
				RoleID:    rootRole.ID,
				MenuID:    menu.ID,
				CanRead:   true,
				CanWrite:  false,
				CanUpdate: false,
				CanDelete: false,
			}
			if err := db.Create(&roleMenu).Error; err != nil {
				log.Printf("Warning: Failed to grant root permission to Audit Logs: %v", err)
			} else {
				log.Printf("Granted root role read permission to Audit Logs menu")
			}
		}
	} else {
		log.Printf("Audit Logs menu already exists (ID: %d)", existing.ID)
	}

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
