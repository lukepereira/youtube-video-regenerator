package functions

import (
	"encoding/json"
	"fmt"
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

func requestArchivedData(id string) (string, error) {
	type Closest struct {
		Url string `json:"url"`
	}
	type ArchiveSnapshot struct {
		Closest Closest `json:"closest"`
	}
	type WaybackResponse struct {
		ArchiveSnapshot ArchiveSnapshot `json:"archived_snapshots"`
	}
	var snapshot WaybackResponse

	youtubeUrl := fmt.Sprintf("https://www.youtube.com/watch?v=%s", id)
	waybackUrl := fmt.Sprintf("http://archive.org/wayback/available?url=%s", youtubeUrl)
	resp, _ := http.Get(waybackUrl)
	body, _ := ioutil.ReadAll(resp.Body)
	err := json.Unmarshal(body, &snapshot)
	if err != nil {
		return "", err
	}

	fmt.Println("requestArchivedData", snapshot.ArchiveSnapshot.Closest.Url)
	return "OK", nil
}
