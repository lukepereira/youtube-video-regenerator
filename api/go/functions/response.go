package functions

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/lukepereira/youtube-video-regenerator/common/writers"
)

type FoundVideo struct {
	Confidence   string `json:"confidence"`
	ThumbnailUrl string `json:"thumbnailUrl"`
	Title        string `json:"title"`
	VideoId      string `json:"videoId"`
}

type ResponseData struct {
	Found    []FoundVideo   `json:"found"`
	NotFound []MissingVideo `json:"not_found"`
}

func handleResponseError(w http.ResponseWriter, err error) {
	w.WriteHeader(http.StatusInternalServerError)
	w.Write([]byte(err.Error()))
	log.Println(err.Error())
}

func handleResponseMessage(w http.ResponseWriter, message string) {
	jw := writers.NewMessageWriter(message)
	jsonString, err := jw.JSONString()

	if err != nil {
		handleResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonString))
}

func sendResponse(
	w http.ResponseWriter,
	found <-chan FoundVideo,
	allVideos []MissingVideo,
) {
	var (
		foundVideos   []FoundVideo
		missingVideos = allVideos[:0]
	)

	for n := range found {
		foundVideos = append(foundVideos, n)
	}

	for _, x := range allVideos {
		if !sliceConainsVideo(foundVideos, x) {
			missingVideos = append(missingVideos, x)
		}
	}

	response := ResponseData{
		Found:    foundVideos,
		NotFound: missingVideos,
	}

	bytesValue, err := json.Marshal(response)
	if err != nil {
		handleResponseError(w, err)
	}

	jsonString := string(bytesValue)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonString))
}

func sliceConainsVideo(fv []FoundVideo, mv MissingVideo) bool {
	for _, x := range fv {
		if x.VideoId == mv.VideoId {
			return true
		}
	}
	return false
}
