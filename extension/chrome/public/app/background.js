const BACKGROUND_ACTIONS = Object.freeze({
    CLICKED_BROWSER_ACTION: 'CLICKED_BROWSER_ACTION',
    TAB_URL_UPDATED: 'TAB_URL_UPDATED',
})

const API_URL = 'https://us-central1-youtube-tools-245705.cloudfunctions.net/'
const CWS_LICENSE_API_URL =
    'https://www.googleapis.com/chromewebstore/v1.1/userlicenses/'

const GO_API_ENDPOINTS = Object.freeze({
    archiveSearch: 'ArchiveSearch',
    webSearch: 'WebSearch',
})

const PYTHON_API_ENDPOINTS = Object.freeze({
    archiveSearch: 'archive_search',
    webSearch: 'web_search',
})

const sendMessage = (message, tabId) => {
    if (tabId) {
        chrome.tabs.sendMessage(tabId, message)
    } else {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            var activeTab = tabs && tabs[0]
            if (activeTab) {
                chrome.tabs.sendMessage(activeTab.id, message)
            }
        })
    }
}

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        sendMessage({
            type: BACKGROUND_ACTIONS.TAB_URL_UPDATED,
            payload: { tabId, changeInfo, tab },
        })
    }
})

chrome.browserAction.onClicked.addListener(tab => {
    // chrome.storage.local.clear()
    // chrome.browserAction.setPopup({ tabId: tab.id, popup: 'index.html' })
    sendMessage({
        type: BACKGROUND_ACTIONS.CLICKED_BROWSER_ACTION,
        payload: {},
    })
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    const actions = request.actions
    const type = request.type
    const tabId = sender.tab.id

    if (actions.DEBUG) {
        console.log(
            'background action ' + type + ' ' + JSON.stringify(request.payload),
        )
    }

    if (type === actions.GET_OAUTH_TOKEN) {
        // In non-interactive mode, if an authorization were needed, calling the getAuthToken method will return error.
        chrome.identity.getAuthToken({ interactive: true }, token => {
            sendMessage(
                {
                    type: actions.GET_OAUTH_TOKEN_SUCCESS,
                    payload: {
                        token,
                    },
                },
                tabId,
            )
        })
    }

    if (type === actions.GET_LICENSE) {
        //TODO: move validation to backend API
        const options = {
            headers: {
                Authorization: 'Bearer ' + token,
            },
        }
        const url = CWS_LICENSE_API_URL + chrome.runtime.id
        fetch(url, options)
            .then(response => response.json())
            .then(response => {
                // chrome.storage.local.set('license', response)
                sendMessage(
                    {
                        type: actions.GET_LICENSE_SUCCESS,
                        payload: {
                            license: response,
                        },
                    },
                    tabId,
                )
            })
    }

    if (type === actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE) {
        const playlistId = request.payload.playlistId
        chrome.storage.local.get([playlistId], result => {
            if (
                !result ||
                !result[playlistId] ||
                !result[playlistId].expires ||
                (result[playlistId].expires &&
                    result[playlistId].expires < Date.now())
            ) {
                sendMessage(
                    {
                        type:
                            actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR,
                        payload: {},
                    },
                    tabId,
                )
            } else {
                sendMessage(
                    {
                        type:
                            actions.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS,

                        payload: {
                            playlistData: result[playlistId],
                        },
                    },
                    tabId,
                )
            }
        })
    }

    if (type === actions.FETCH_ARCHIVED_PLAYLIST_DATA) {
        //TODO: rate limit by identity.id, playlist, timestamp
        // chrome.identity.getProfileUserInfo(identity => {})
        fetch(`${API_URL}${GO_API_ENDPOINTS.archiveSearch}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.payload.unplayableVideoData),
        })
            .then(response => response.json())
            .then(response =>
                sendMessage(
                    {
                        type: actions.FETCH_ARCHIVED_PLAYLIST_DATA_SUCCESS,
                        payload: {
                            playlistData: response,
                        },
                    },
                    tabId,
                ),
            )
            .catch()
    }

    if (type === actions.FETCH_WEB_SEARCHED_PLAYLIST_DATA) {
        fetch(`${API_URL}${GO_API_ENDPOINTS.webSearch}`, {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request.payload.unplayableVideoData),
        })
            .then(response => response.json())
            .then(response =>
                sendMessage(
                    {
                        type: actions.FETCH_WEB_SEARCHED_PLAYLIST_DATA_SUCCESS,
                        payload: {
                            playlistData: response,
                        },
                    },
                    tabId,
                ),
            )
            .catch()
    }

    if (type === actions.STORE_PLAYLIST_DATA) {
        const playlistId = request.payload.playlistId
        const newPlaylistData = request.payload.playlistData
        const expires = new Date(Date.now() + 86400 * 1000).getTime()
        chrome.storage.local.get([playlistId], result => {
            const existingData = result[playlistId]
            const existingFound = (existingData && existingData.found) || []
            const existingNotFound =
                (existingData && existingData.not_found) || []
            const mergedData = {
                expires,
                found: [...existingFound, ...newPlaylistData.found],
                not_found: [...existingNotFound, ...newPlaylistData.not_found],
            }
            chrome.storage.local.set(
                {
                    [playlistId]: mergedData,
                },
                () => {
                    sendMessage(
                        {
                            type: actions.STORE_PLAYLIST_DATA_SUCCESS,
                            payload: {
                                playlistData: mergedData,
                            },
                        },
                        tabId,
                    )
                },
            )
        })
    }

    if (type === actions.REDIRECT_TO_URL) {
        if (tabId) {
            chrome.tabs.update(tabId, { url: request.payload.url })
        } else {
            chrome.tabs.query({ active: true, currentWindow: true }, tab => {
                chrome.tabs.update(tab.id, { url: request.payload.url })
            })
        }
    }
})
