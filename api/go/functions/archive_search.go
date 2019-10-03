package functions

import (
	"net/http"
	"sync"
)

func ArchiveSearch(w http.ResponseWriter, r *http.Request) {
	concurrentSearch(w, r, archiveSearch, 0)
}

func archiveSearch(
	w http.ResponseWriter,
	wg *sync.WaitGroup,
	found chan<- FoundVideo,
	mv MissingVideo,
) {
	defer wg.Done()

	missingVideoId := getFieldString(&mv, "VideoId")
	index := getFieldString(&mv, "Index")

	snapshotUrl, err := getSnapshotUrl(missingVideoId)
	if err != nil {
		return
	}
	foundVideoTitle, err := getVideoTitleFromSnapshot(snapshotUrl)
	if err != nil {
		return
	}
	foundVideoId, err := getVideoIdFromYoutube(foundVideoTitle)
	if err != nil {
		return
	}
	foundThumbnailUrl := getThumbnailUrl(foundVideoId)

	FoundVideoData := FoundVideo{
		Confidence:   "HIGH",
		ThumbnailUrl: foundThumbnailUrl,
		Title:        foundVideoTitle,
		VideoId:      foundVideoId,
		Index:        index,
	}

	found <- FoundVideoData
}
