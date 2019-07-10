const ACTIONS = Object.freeze({
    CLICKED_BROWSER_ACTION: "CLICKED_BROWSER_ACTION",
    GET_ACTIONS: "GET_ACTIONS",
    GET_ACTIONS_SUCCESS: "GET_ACTIONS_SUCCESS",
    TAB_URL_UPDATED: "TAB_URL_UPDATED",
    GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE: "GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE",
    GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS: "GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS",
    GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR: "GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR",
    FETCH_PLAYLIST_DATA: "FETCH_PLAYLIST_DATA",
    FETCH_PLAYLIST_DATA_SUCCESS: "FETCH_PLAYLIST_DATA_SUCCESS",
    FETCH_PLAYLIST_DATA_ERROR: "FETCH_PLAYLIST_DATA_ERROR",
    STORE_PLAYLIST_DATA: "STORE_PLAYLIST_DATA",
    STORE_PLAYLIST_DATA_SUCCESS: "STORE_PLAYLIST_DATA_SUCCESS",
    STORE_PLAYLIST_DATA_ERROR: "STORE_PLAYLIST_DATA_ERROR",
    REDIRECT_TO_URL: "REDIRECT_TO_URL",
    REDIRECT_TO_URL_SUCCESS: "REDIRECT_TO_URL_SUCCESS",
    REDIRECT_TO_URL_ERROR: "REDIRECT_TO_URL_ERROR",
})

const API_URL = 'https://us-central1-youtube-tools-245705.cloudfunctions.net/playlist'

const sendMessage = (message) => {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        var activeTab = tabs[0]
        if (activeTab) {
            chrome.tabs.sendMessage(activeTab.id, message)
        }
    })
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        sendMessage({
            type: ACTIONS.TAB_URL_UPDATED,
            payload: { tabId, changeInfo, tab },
        })
    }
})

chrome.browserAction.onClicked.addListener(function(tab) {
    sendMessage({
        type: ACTIONS.CLICKED_BROWSER_ACTION,
        payload: {},
    })
 });

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    // alert("background action" + request.type)
    if (request.type === ACTIONS.GET_ACTIONS) {
        sendMessage({
            type: ACTIONS.GET_ACTIONS_SUCCESS,
            payload: {
                actions: ACTIONS,
            }
        })
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE) {
        const playlistId = request.payload.playlistId
        chrome.storage.sync.get(
            [ playlistId ],
            (result) => {
                // TODO check timestamp
                if (result && result[playlistId]) {
                    sendMessage({
                        type: ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS,
                        payload: {
                            playlistData: result[playlistId],
                        }
                    })
                }
                else {
                    sendMessage({
                        type: ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR,
                        payload: { }
                    })
                }

            }
        )
    }

    if (request.type === ACTIONS.FETCH_PLAYLIST_DATA) {
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
                    type: ACTIONS.FETCH_PLAYLIST_DATA_SUCCESS,
                    payload: {
                        playlistData: response,
                    },
                })
            )
            .catch()
    }

    if (request.type === ACTIONS.STORE_PLAYLIST_DATA) {
        //TODO: store timestamp and calculate expiration of 1 hour
        const playlistId = request.payload.playlistId
        const newPlaylistData = request.payload.playlistData
        chrome.storage.sync.get(
            [ playlistId ],
            (result) => {
                const existingData = result[playlistId]
                const mergedData = {
                    ...existingData,
                    ...newPlaylistData,
                }
                chrome.storage.sync.set({
                    [playlistId]: mergedData,
                }, () => {
                    sendMessage({
                        type: ACTIONS.STORE_PLAYLIST_DATA_SUCCESS,
                        payload: {
                            playlistData: mergedData,
                        },
                    })
                 })

            }
        )
    }

    if (request.type === ACTIONS.REDIRECT_TO_URL) {
        chrome.tabs.query({ active: true, currentWindow: true}, (tab) => {
            chrome.tabs.update(tab.id, { url: request.payload.url })
        })
    }

})
