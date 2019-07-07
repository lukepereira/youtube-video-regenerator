/*
1. Initialize playlist with data
- Get playlist id from url
- Check local storage if replacement video data already exists in local storage
- Create object with urls and index of all deleted/unplayable videos
- make request to API with JSON
- store response in local storage

2. if current index is an unplayable video, go to url of replacement video

3. if current index is one less than unplayable video, monitor video and redirect to replacment video after it completes

*/

/*global chrome*/

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

window.onload = () => {
    runPlaylistScript()
}

const sendMessage = (message) => {
    chrome.runtime.sendMessage(
        message
    )
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    // alert('content_script action ' + request.type)

    if (request.type === ACTIONS.TAB_URL_UPDATED) {
        runPlaylistScript()
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS) {
        if (request.payload.playlistData) {
            handleUnplayableVideoRedirect(request.payload.playlistData)
        }
        else {
            const unplayableVideoData = getUnplayableVideoDataFromDOM()
            sendMessage({
                type: ACTIONS.FETCH_PLAYLIST_DATA,
                payload: {
                    unplayableVideoData,
                },
            })
        }
    }

    if (request.type === ACTIONS.FETCH_PLAYLIST_DATA_SUCCESS) {
        storePlaylistDataInLocalStorage(request.payload.playlistData)
        handleUnplayableVideoRedirect(request.payload.playlistData)
    }
})

const runPlaylistScript = () => {
    const playlistId = getPlaylistId()
    if (playlistId) {
        getPlaylistDataFromLocalStorage(playlistId)
    }
}

const getPlaylistDataFromLocalStorage = (playlistId) => {
    sendMessage({
        type: ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE,
        payload: {
            playlistId,
        },
    })
}

const getUnplayableVideoDataFromDOM = () => {
    return [
        {
            url: 'testUrl',
            index: 2,
        }
    ]
}

const storePlaylistDataInLocalStorage = (playlistData) => {
    sendMessage({
        type: ACTIONS.STORE_PLAYLIST_DATA,
        payload: {
            playlistData,
            playlistId: getPlaylistId(),
        },
    })
}

const handleUnplayableVideoRedirect = (playlistData) => {
    const currentIndex = getCurrentIndex()

    playlistData.forEach((replacementVideoData) => {
        const replacementVideoIndex = parseInt(replacementVideoData.index)
        if (
            currentIndex === replacementVideoIndex &&
            replacementVideoData.videoId !== getCurrentVideoId()
        ) {
            redirectToReplacementVideo(replacementVideoData)
        }
        if (currentIndex + 1 === replacementVideoIndex) {
            const replacementVideoRedirectURL = getReplacementVideoRedirectURL(replacementVideoData)
            const video = document.querySelector('video')
            video.addEventListener('timeupdate', (event) => {
                if (event.target.currentTime + 10 >= event.target.duration) {
                    redirectToReplacementVideo(replacementVideoRedirectURL)
                }
            })
        }
    })
}

const getReplacementVideoRedirectURL = (replacementVideoData) => {
    const videoId = replacementVideoData.videoId
    const index = replacementVideoData.index
    const playlistId = getPlaylistId()
    return`https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`
}

const redirectToReplacementVideo = (url) => {
    sendMessage({
        type: ACTIONS.REDIRECT_TO_URL,
        payload: {
            url,
        },
    })
}



/* helpers */

const getPlaylistId = () => {
    return getUrlParams('list')
}

const getCurrentIndex = () => {
    return parseInt(getUrlParams('index'))
}

const getCurrentVideoId = () => {
    return getUrlParams('v')
}

const getUrlParams = (parameter) => {
    const url = window.location.href
    const vars = {}
    const parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    })
    return vars[parameter] || ''
}


