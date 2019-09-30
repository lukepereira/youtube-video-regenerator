package functions

import (
	"fmt"
	"net/http"

	"github.com/lukepereira/youtube-video-regenerator/common/writers"
)

func WebSearch(w http.ResponseWriter, r *http.Request) {
	if err := r.ParseForm(); err != nil {
		handleResponseError(w, err)
		return
	}
	fmt.Fprintf(w, "Post from website! r.PostFrom = %v\n", r.PostForm)

	message := "a"
	jw := writers.NewMessageWriter(message)
	jsonString, err := jw.JSONString()

	if err != nil {
		handleResponseError(w, err)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(jsonString))
}
