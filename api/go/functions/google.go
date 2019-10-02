package functions

import (
	"fmt"
	"net/url"
	s "strings"

	"github.com/anaskhan96/soup"
)

func getGoogleSearchUrl(videoId string) string {
	numberOfResults := 1
	query := url.QueryEscape(videoId)
	return fmt.Sprintf("https://www.google.com/search?q=site%%3Ayoutu.be%%2F%s&num=%d", query, numberOfResults)
}

func getVideoTitleWebSearch(url string) (string, error) {
	numberOfResults := 1
	resp, _ := soup.Get(url)
	doc := soup.HTMLParse(resp)

	resultElements := doc.Find("div", "id", "main").Children()[3 : 3+numberOfResults]
	link := resultElements[0].Find("a")
	err := link.Error
	if err != nil {
		return "", err
	}

	fullTitle := link.Find("div").Text()
	placeholder := " - Youtu.be"
	title := s.Split(fullTitle, placeholder)[0]
	return title, nil
}
