package functions

import (
	"fmt"
	"net/http"
	"sync"
)

func ArchiveSearch(w http.ResponseWriter, r *http.Request) {
	var (
		requestedVideoData = parseRequest(w, r)
		found              = make(chan FoundVideo)
		missing            = make(chan MissingVideo)
		finished           = make(chan struct{})
		wg                 sync.WaitGroup
	)

	go func() {
		sendReponse(w, found, missing)
		close(finished)
	}()

	for _, videoData := range requestedVideoData {
		wg.Add(1)
		go findReplacementVideo(w, &wg, videoData, found, missing)
	}

	wg.Wait()
	close(found)
	close(missing)
	<-finished
}

func findReplacementVideo(
	w http.ResponseWriter,
	wg *sync.WaitGroup,
	mv MissingVideo,
	found chan<- FoundVideo,
	missing chan<- MissingVideo,
) {
	defer wg.Done()

	videoId := getFieldString(&mv, "VideoId")
	videoData, _ := requestArchivedData(videoId)
	fmt.Println("findReplacementVideo", videoData)

	found <- FoundVideo{
		Confidence:   "a",
		ThumbnailUrl: "b",
		Title:        "c",
		VideoId:      "d",
	}

}
