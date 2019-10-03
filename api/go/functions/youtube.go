package functions

import (
	"fmt"
	"net/url"

	"github.com/anaskhan96/soup"
)

func getVideoIdFromYoutube(videoTitle string) (string, error) {
	query := url.QueryEscape(videoTitle)
	url := fmt.Sprintf("https://www.youtube.com/results?search_query=%s", query)

	resp, err := soup.Get(url)
	if err != nil {
		return "", err
	}

	doc := soup.HTMLParse(resp)

	resultContainer := doc.Find("div", "id", "results")
	err = resultContainer.Error
	if err != nil {
		return "", err
	}

	firstResult := resultContainer.Find("ol", "class", "item-section")
	err = firstResult.Error
	if err != nil {
		return "", err
	}

	videoId := firstResult.Find("div").Attrs()["data-context-item-id"]

	return videoId, nil
}

func getThumbnailUrl(videoId string) string {
	return fmt.Sprintf("https://i.ytimg.com/vi/%s/hqdefault.jpg", videoId)
}
