const BACKGROUND_ACTIONS = Object.freeze({
    CLICKED_BROWSER_ACTION: "CLICKED_BROWSER_ACTION",
    TAB_URL_UPDATED: "TAB_URL_UPDATED",
})

const API_URL = 'https://us-central1-youtube-tools-245705.cloudfunctions.net/playlist'

const sendMessage = (message) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var activeTab = tabs && tabs[0]
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, message)
        }
    })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        sendMessage({
            type: BACKGROUND_ACTIONS.TAB_URL_UPDATED,
            payload: { tabId, changeInfo, tab },
        })
    }
})

chrome.browserAction.onClicked.addListener((tab) => {
    // chrome.storage.local.clear()
    sendMessage({
        type: BACKGROUND_ACTIONS.CLICKED_BROWSER_ACTION,
        payload: {},
    })
 })

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const actions = request.actions
    const type = request.type

    if (actions.DEBUG) {
        alert('background action ' + type + ' ' + JSON.stringify(request.payload))
    }

    if (type === actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE) {
        const playlistId = request.payload.playlistId
        chrome.storage.local.get(
            [playlistId],
            (result) => {
                // TODO check timestamp
                if (result && result[playlistId]) {
                    sendMessage({
                        type: actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS,
                        payload: {
                            playlistData: result[playlistId],
                        }
                    })
                }
                else {
                    sendMessage({
                        type: actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR,
                        payload: { }
                    })
                }

            }
        )
    }

    if (type === actions.FETCH_PLAYLIST_DATA) {
        fetch(API_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request.payload.unplayableVideoData),
        })
            .then(response => response.json())
            .then(response =>
                sendMessage({
                    type: actions.FETCH_PLAYLIST_DATA_SUCCESS,
                    payload: {
                        playlistData: response,
                    },
                })
            )
            .catch()
    }

    if (type === actions.STORE_PLAYLIST_DATA) {
        //TODO: store timestamp and calculate expiration of 1 hour
        const playlistId = request.payload.playlistId
        const newPlaylistData = request.payload.playlistData
        chrome.storage.local.get(
            [ playlistId ],
            (result) => {
                const existingData = result[playlistId]
                const mergedData = {
                    ...existingData,
                    ...newPlaylistData,
                }
                chrome.storage.local.set({
                    [playlistId]: mergedData,
                }, () => {
                    sendMessage({
                        type: actions.STORE_PLAYLIST_DATA_SUCCESS,
                        payload: {
                            playlistData: mergedData,
                        },
                    })
                })

            }
        )
    }

    if (type === actions.REDIRECT_TO_URL) {
        chrome.tabs.query({ active: true, currentWindow: true}, (tab) => {
            chrome.tabs.update(tab.id, { url: request.payload.url })
        })
    }

})
