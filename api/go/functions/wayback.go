package functions

import (
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"net/http"
	"regexp"
	"strings"

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
		return "", errors.New("Fetching archive URL failed.")
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	err = json.Unmarshal(body, &snapshot)
	if err != nil || snapshot == (WaybackResponse{}) {
		return "", errors.New("Snapshot URL doesn't exist.")
	}
	return snapshot.ArchivedSnapshots.Closest.Url, nil
}

func getVideoTitleFromSnapshot(url string) (string, error) {
	resp, _ := soup.Get(url)
	doc := soup.HTMLParse(resp)
	title := doc.Find("title").Text()

	if title == "YouTube" {
		re := regexp.MustCompile(`document.title = .*`)
		title = fmt.Sprintf("%q\n", re.Find([]byte(resp)))
		title = strings.Replace(strings.TrimSpace(title), `"`, ``, -1)
		title = strings.Replace(title, `document.title = `, ``, -1)
		title = strings.Replace(title, ` - YouTube;`, ``, -1)
	} else {
		title = strings.Replace(title, "- YouTube", ``, -1)
	}

	if len(title) == 0 {

		return "", errors.New("Title could not be parsed.")
	}

	return title, nil

}
