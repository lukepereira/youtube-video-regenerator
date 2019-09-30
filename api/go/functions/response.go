package functions

import (
	"fmt"
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

func sendReponse(
	w http.ResponseWriter,
	found <-chan FoundVideo,
	missing <-chan MissingVideo,
) {
	var (
		foundVideos   []FoundVideo
		missingVideos []MissingVideo
	)
	for n := range found {
		foundVideos = append(foundVideos, n)
		fmt.Println(n)
	}
	for n := range missing {
		missingVideos = append(missingVideos, n)
		fmt.Println(n)
	}
}
