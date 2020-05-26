package functions

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestWebSearch(t *testing.T) {
	videoData := []byte(`[{"index": "2" , "videoId": "cXb_yyVEq0Q", "url": "1234"}]`)
	r, _ := http.NewRequest("POST", "", bytes.NewBuffer(videoData))
	w := httptest.NewRecorder()

	handler := http.HandlerFunc(WebSearch)
	handler.ServeHTTP(w, r)
	resp := w.Result()

	if resp.StatusCode != http.StatusOK {
		t.Errorf("Wrong status code: got %v want %v", resp.StatusCode, http.StatusOK)
	}
}
