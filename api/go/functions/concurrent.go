package functions

import (
	"net/http"
	"sync"
	"time"
)

type Search func(
	w http.ResponseWriter,
	wg *sync.WaitGroup,
	found chan<- FoundVideo,
	mv MissingVideo,
)

func concurrentSearch(w http.ResponseWriter, r *http.Request, findReplacement Search, sleepSeconds int) {
	var (
		requestedVideoData = parseRequest(w, r)
		found              = make(chan FoundVideo)
		finished           = make(chan struct{})
		wg                 sync.WaitGroup
	)

	go func() {
		sendResponse(w, found, requestedVideoData)
		close(finished)
	}()

	for _, videoData := range requestedVideoData {
		wg.Add(1)
		time.Sleep(time.Duration(sleepSeconds) * time.Second)
		go findReplacement(w, &wg, found, videoData)
	}

	wg.Wait()
	close(found)
	<-finished
}
