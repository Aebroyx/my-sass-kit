package handlers

import (
	"net/http"

	"github.com/Aebroyx/sass-api/internal/common"
	"github.com/Aebroyx/sass-api/internal/services"
	"github.com/gin-gonic/gin"
)

type SearchHandler struct {
	searchService *services.SearchService
}

func NewSearchHandler(searchService *services.SearchService) *SearchHandler {
	return &SearchHandler{
		searchService: searchService,
	}
}

// GlobalSearch handles GET /api/search/global
func (h *SearchHandler) GlobalSearch(c *gin.Context) {
	query := c.Query("q")

	// Validate minimum query length
	if len(query) < 3 {
		common.SendError(c, http.StatusBadRequest, "Search query must be at least 3 characters", common.CodeBadRequest, nil)
		return
	}

	// Perform search
	results, err := h.searchService.GlobalSearch(query, 5)
	if err != nil {
		common.SendError(c, http.StatusInternalServerError, "Failed to perform search", common.CodeInternalError, err.Error())
		return
	}

	common.SendSuccess(c, http.StatusOK, "Search completed successfully", results)
}
