const ACTIONS = {
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
}

const API_URL = 'http://www.mocky.io/v2/5d2170162f00002101c462a8'

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

chrome.runtime.onMessage.addListener( (request, sender, sendResponse) => {
    // alert("background action" + request.type)
    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE) {
        const playlistId = request.payload.playlistId
        chrome.storage.sync.get(
            [ playlistId ],
            (result) => {
                sendMessage({
                    type: ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS,
                    payload: {
                        playlistData: result[playlistId] || null,
                    }
                })
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
        const playlistId = request.payload.playlistId
        const playlistData = request.payload.playlistData
        chrome.storage.sync.set({
            [playlistId]: playlistData,
        }, () => {
            sendMessage({
                type: ACTIONS.STORE_PLAYLIST_DATA_SUCCESS,
                payload: { playlistData },
            })
         })
    }

    if (request.type === ACTIONS.REDIRECT_TO_URL) {
        chrome.tabs.query({ active: true, currentWindow: true}, (tab) => {
            chrome.tabs.update(tab.id, { url: request.payload.url })
        })
    }

})
