package functions

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	s "strings"

	"github.com/anaskhan96/soup"
)

type Closest struct {
	Url string `json:"url,omitempty"`
}
type ArchivedSnapshots struct {
	Closest Closest `json:"closest,omitempty"`
}
type WaybackResponse struct {
	ArchivedSnapshots ArchivedSnapshots `json:"archived_snapshots,omitempty"`
}

func getSnapshotUrl(id string) (string, error) {
	var (
		snapshot WaybackResponse
	)

	youtubeUrl := fmt.Sprintf("https://www.youtube.com/watch?v=%s", id)
	waybackUrl := fmt.Sprintf("http://archive.org/wayback/available?url=%s", youtubeUrl)
	resp, err := http.Get(waybackUrl)

	if err != nil || resp.StatusCode != 200 {
		return "", errors.New("Fetching archive URL failed")
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	err = json.Unmarshal(body, &snapshot)
	if err != nil || snapshot == (WaybackResponse{}) {
		return "", errors.New("Snapshot URL doesn't exist ")
	}
	return snapshot.ArchivedSnapshots.Closest.Url, nil
}

func getVideoTitleFromSnapshot(url string) (string, error) {
	resp, _ := soup.Get(url)
	doc := soup.HTMLParse(resp)
	fullTitle := doc.Find("title").Text()
	placeholder := " - YouTube"
	title := s.Split(fullTitle, placeholder)[0]
	return title, nil
}
