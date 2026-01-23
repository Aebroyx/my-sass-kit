package services

import (
	"sync"

	"github.com/Aebroyx/sass-api/internal/config"
	"github.com/Aebroyx/sass-api/internal/domain/models"
	"gorm.io/gorm"
)

type SearchService struct {
	db     *gorm.DB
	config *config.Config
}

func NewSearchService(db *gorm.DB, config *config.Config) *SearchService {
	return &SearchService{
		db:     db,
		config: config,
	}
}

// GlobalSearch searches across users, roles, and menus
func (s *SearchService) GlobalSearch(query string, limit int) (*models.GlobalSearchResponse, error) {
	if limit <= 0 {
		limit = 5 // Default limit per category
	}

	var wg sync.WaitGroup
	var usersErr, rolesErr, menusErr error

	response := &models.GlobalSearchResponse{
		Users: []models.SearchUser{},
		Roles: []models.SearchRole{},
		Menus: []models.SearchMenu{},
	}

	searchPattern := "%" + query + "%"

	// Search users in parallel
	wg.Add(1)
	go func() {
		defer wg.Done()
		var users []models.Users
		usersErr = s.db.
			Where("is_deleted = ?", false).
			Where("name ILIKE ? OR email ILIKE ? OR username ILIKE ?", searchPattern, searchPattern, searchPattern).
			Limit(limit).
			Find(&users).Error

		if usersErr == nil {
			for _, u := range users {
				response.Users = append(response.Users, models.SearchUser{
					ID:       u.ID,
					Name:     u.Name,
					Email:    u.Email,
					Username: u.Username,
				})
			}
		}
	}()

	// Search roles in parallel
	wg.Add(1)
	go func() {
		defer wg.Done()
		var roles []models.Role
		rolesErr = s.db.
			Where("name ILIKE ? OR display_name ILIKE ?", searchPattern, searchPattern).
			Limit(limit).
			Find(&roles).Error

		if rolesErr == nil {
			for _, r := range roles {
				response.Roles = append(response.Roles, models.SearchRole{
					ID:          r.ID,
					Name:        r.Name,
					DisplayName: r.DisplayName,
				})
			}
		}
	}()

	// Search menus in parallel
	wg.Add(1)
	go func() {
		defer wg.Done()
		var menus []models.Menu
		menusErr = s.db.
			Where("is_active = ?", true).
			Where("name ILIKE ? OR path ILIKE ?", searchPattern, searchPattern).
			Limit(limit).
			Find(&menus).Error

		if menusErr == nil {
			for _, m := range menus {
				response.Menus = append(response.Menus, models.SearchMenu{
					ID:   m.ID,
					Name: m.Name,
					Path: m.Path,
					Icon: m.Icon,
				})
			}
		}
	}()

	wg.Wait()

	// Return first error encountered
	if usersErr != nil {
		return nil, usersErr
	}
	if rolesErr != nil {
		return nil, rolesErr
	}
	if menusErr != nil {
		return nil, menusErr
	}

	return response, nil
}
