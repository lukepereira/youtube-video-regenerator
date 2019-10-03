package functions

import (
	"net/http"
	"sync"
)

func WebSearch(w http.ResponseWriter, r *http.Request) {
	concurrentSearch(w, r, webSearch, 1)
}

func webSearch(
	w http.ResponseWriter,
	wg *sync.WaitGroup,
	found chan<- FoundVideo,
	mv MissingVideo,
) {
	defer wg.Done()

	missingVideoId := getFieldString(&mv, "VideoId")
	index := getFieldString(&mv, "Index")

	url := getGoogleSearchUrl(missingVideoId)
	foundVideoTitle, err := getVideoTitleWebSearch(url)
	if err != nil {
		return
	}

	foundVideoId, err := getVideoIdFromYoutube(foundVideoTitle)
	if err != nil {
		return
	}

	foundThumbnailUrl := getThumbnailUrl(foundVideoId)

	FoundVideoData := FoundVideo{
		Confidence:   "MEDIUM",
		ThumbnailUrl: foundThumbnailUrl,
		Title:        foundVideoTitle,
		VideoId:      foundVideoId,
		Index:        index,
	}
	found <- FoundVideoData
}
