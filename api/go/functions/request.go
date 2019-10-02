package functions

import (
	"encoding/json"
	"io/ioutil"
	"net/http"
	"reflect"
)

type MissingVideo struct {
	Index   string `json:"index"`
	Url     string `json:"url"`
	VideoId string `json:"videoId"`
}

func getFieldString(v *MissingVideo, field string) string {
	r := reflect.ValueOf(v)
	f := reflect.Indirect(r).FieldByName(field)
	return f.String()
}

func parseRequest(w http.ResponseWriter, r *http.Request) []MissingVideo {
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		handleResponseError(w, err)
	}

	var requestedVideoData []MissingVideo
	err = json.Unmarshal(body, &requestedVideoData)
	if err != nil {
		handleResponseError(w, err)
	}
	return requestedVideoData
}
