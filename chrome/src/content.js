/*

Video redirection:
1. Initialize playlist with data
    - Get playlist id from url
    - Check local storage if replacement video data already exists in local storage
    - Create object with urls and index of all deleted/unplayable videos
    - make request to API with JSON
    - store response in local storage
2. if current index is an unplayable video, go to url of replacement video
3. if current index is one less than unplayable video, monitor video and redirect to replacment video after it completes

API:
Via Google (less accurate)
1. search google with video id for replacement youtube video string
2. query videos via youtube api
2. return video id, url, thumbnail url, video title,

Via wayback machine (might be slower)
1. http://archive.org/wayback/available?url=https://www.youtube.com/watch?v=${videoId}
    (https://archive.org/help/wayback_api.php)
2. fetch archived_snapshots.closest.url
3. extract video title from html
4. query youtube

UI injection:
1. replace deleted videos with existing video thumbnail and url and indication of add-on

*/

/*global chrome*/

import {
    getCurrentIndex,
    getCurrentVideoId,
    getPlaylistId,
    getUrlParams
} from './helpers'

import {
    ACTIONS
} from './actions'

window.onload = () => {
    // runPlaylistScript()
}

const sendMessage = (message) => {
    chrome.runtime.sendMessage(
        message
    )
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    alert('content_script action ' + request.type)

    if (request.type === ACTIONS.CLICKED_BROWSER_ACTION) {
        runPlaylistScript()
    }

    if (request.type === ACTIONS.TAB_URL_UPDATED) {
        runPlaylistScript()
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS) {
        handleUnplayableVideoRedirect(request.payload.playlistData)
        handleUnplayableVideoDomUpdates(request.payload.playlistData)
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR) {
        const unplayableVideoData = getUnplayableVideoDataFromDOM()
        if (!unplayableVideoData.length) {
            return
        }
        // TODO: split these messages into chunks of 10 to prevent timeouts
        const chunks = convertArrayToChunks(unplayableVideoData, 5)
        chunks.forEach((messageChunk) => {
            sendMessage({
                type: ACTIONS.FETCH_PLAYLIST_DATA,
                payload: {
                    unplayableVideoData: messageChunk,
                },
            })
        })
    }

    if (request.type === ACTIONS.FETCH_PLAYLIST_DATA_SUCCESS) {
        storePlaylistDataInLocalStorage(request.payload.playlistData)
        handleUnplayableVideoRedirect(request.payload.playlistData)
        handleUnplayableVideoDomUpdates(request.payload.playlistData)
    }
})

const runPlaylistScript = () => {
    const playlistId = getPlaylistId()
    if (!playlistId) {
        return
    }
    //TODO: wait for playlist elements to load on dom
    getPlaylistDataFromLocalStorage(playlistId)
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
    const unplayableVideoData = []
    const unplayableVideos = document.querySelectorAll('#unplayableText:not([hidden])')
    unplayableVideos.forEach((unplayabledVideoElement) => {
        const unplayableVideoUrl = unplayabledVideoElement.closest('a').href
        const videoData = {
            url: unplayableVideoUrl,
            videoId: getUrlParams('v', unplayableVideoUrl),
            index: getUrlParams('index', unplayableVideoUrl),
        }
        unplayableVideoData.push(videoData)
    })
    return unplayableVideoData
}

const convertArrayToChunks = (list, chunkSize=10) => {
    if (!list.length) {
        return []
    }
    var i, j, t, chunks = []
    for (i = 0, j = list.length; i < j; i += chunkSize) {
        t = list.slice(i, i + chunkSize)
        chunks.push(t)
    }
    return chunks
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
    Object.keys(playlistData).forEach((playlistIndex) => {

        const replacementVideoIndex = parseInt(playlistIndex)
        const replacementVideoData = playlistData[replacementVideoIndex]

        if (
            currentIndex === replacementVideoIndex &&
            replacementVideoData.videoId !== getCurrentVideoId()
        ) {
            redirectToReplacementVideo(replacementVideoData)
        }
        if (currentIndex + 1 === replacementVideoIndex) {
            const replacementVideoRedirectURL = getReplacementVideoRedirectURL(
                replacementVideoData[0],
                replacementVideoIndex
            )
            const video = document.querySelector('video')
            video.addEventListener('timeupdate', (event) => {
                if (event.target.currentTime + 5 >= event.target.duration) {
                    redirectToReplacementVideo(replacementVideoRedirectURL)
                }
            })
        }
    })
}

const handleUnplayableVideoDomUpdates = (playlistData) => {
    Object.keys(playlistData).forEach((playlistIndex) => {
        const replacementVideoIndex = parseInt(playlistIndex)
        const replacementVideoData = playlistData[playlistIndex][0]

        const title = replacementVideoData.snippet.title
        const thumbnailUrl = replacementVideoData.snippet.thumbnails.high.url
        const url = `/watch?v=${replacementVideoData.id.videoId}&list=${getPlaylistId()}&index=${replacementVideoIndex}`

        const unplayableVideoElement = document.querySelectorAll('span#index')[replacementVideoIndex - 1]
        const container = unplayableVideoElement.closest('div#container')
        container.style = 'border:1px solid green'
        container.closest('a').href = url
        container.querySelector('img#img').src = thumbnailUrl
        container.querySelector('span#video-title').innerText = title
        container.querySelector('#unplayableText').style = 'display:none'
    })
}

const getReplacementVideoRedirectURL = (replacementVideoData, index) => {
    const videoId = replacementVideoData.id.videoId
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
