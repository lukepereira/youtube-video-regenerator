/*global chrome*/

import {
    getCurrentIndex,
    getCurrentVideoId,
    getPlaylistId,
    getUrlParams,
} from './helpers'

import { ACTIONS } from './actions'

import {
    getPlaylistDataFromArchiveApi,
    getPlaylistDataFromWebSearchApi,
    getPlaylistDataFromLocalStorage,
    storePlaylistDataInLocalStorage,
    redirectToReplacementVideo,
} from './messages'

const runPlaylistScript = () => {
    const playlistId = getPlaylistId()
    if (!playlistId) {
        return
    }
    if (!window.location.pathname.split('/')[1] === 'watch') {
        return
    }
    //TODO: wait for playlist elements to load on dom
    getPlaylistDataFromLocalStorage(playlistId)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (ACTIONS.DEBUG) {
        alert('content_script action ' + request.type, request.payload)
    }

    if (request.type === ACTIONS.CLICKED_BROWSER_ACTION) {
        runPlaylistScript()
    }

    if (request.type === ACTIONS.TAB_URL_UPDATED) {
        runPlaylistScript()
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_SUCCESS) {
        handleUnplayableVideoRedirect(request.payload.playlistData.found)
        handleUnplayableVideoDomUpdates(request.payload.playlistData.found)
    }

    if (request.type === ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE_ERROR) {
        const unplayableVideoData = getUnplayableVideoDataFromDOM()
        if (!unplayableVideoData.length) {
            return
        }
        const chunks = convertArrayToChunks(unplayableVideoData, 5)
        chunks.forEach(messageChunk =>
            getPlaylistDataFromArchiveApi(messageChunk),
        )
    }

    if (request.type === ACTIONS.FETCH_ARCHIVED_PLAYLIST_DATA_SUCCESS) {
        const playlistId = getPlaylistId()
        handleUnplayableVideoRedirect(request.payload.playlistData.found)
        handleUnplayableVideoDomUpdates(request.payload.playlistData.found)

        const notFoundResponse = request.payload.playlistData.not_found
        if (Object.keys(notFoundResponse).length) {
            const unplayableVideoData = Object.keys(notFoundResponse).map(
                key => {
                    const notFoundData = notFoundResponse[key]
                    return {
                        videoId: notFoundData.videoId,
                        index: key,
                        url: `https://www.youtube.com/watch?v=${
                            notFoundData.videoId
                        }&list=${playlistId}&index=${key}`,
                    }
                },
            )
            getPlaylistDataFromWebSearchApi(unplayableVideoData)

            storePlaylistDataInLocalStorage(playlistId, {
                found: request.payload.playlistData.found,
                not_found: {},
            })
        } else {
            storePlaylistDataInLocalStorage(
                playlistId,
                request.payload.playlistData,
            )
        }
    }

    if (request.type === ACTIONS.FETCH_WEB_SEARCHED_PLAYLIST_DATA_SUCCESS) {
        const playlistId = getPlaylistId()
        storePlaylistDataInLocalStorage(
            playlistId,
            request.payload.playlistData,
        )
        handleUnplayableVideoRedirect(request.payload.playlistData.found)
        handleUnplayableVideoDomUpdates(request.payload.playlistData.found)
    }
})

const getUnplayableVideoDataFromDOM = () => {
    const unplayableVideoData = []
    const unplayableVideos = document.querySelectorAll(
        '#unplayableText:not([hidden])',
    )
    unplayableVideos.forEach(unplayabledVideoElement => {
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

const convertArrayToChunks = (list, chunkSize = 10) => {
    if (!list.length) {
        return []
    }
    var i,
        j,
        t,
        chunks = []
    for (i = 0, j = list.length; i < j; i += chunkSize) {
        t = list.slice(i, i + chunkSize)
        chunks.push(t)
    }
    return chunks
}

const getReplacementVideoRedirectURL = (replacementVideoData, index) => {
    const videoId = replacementVideoData.videoId
    const playlistId = getPlaylistId()
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`
}

const handleUnplayableVideoRedirect = playlistData => {
    const currentIndex = getCurrentIndex()
    Object.keys(playlistData).forEach(playlistIndex => {
        const replacementVideoIndex = parseInt(playlistIndex)
        const replacementVideoData = playlistData[replacementVideoIndex]
        const replacementVideoRedirectURL = getReplacementVideoRedirectURL(
            replacementVideoData,
            replacementVideoIndex,
        )

        if (
            currentIndex === replacementVideoIndex &&
            replacementVideoData.videoId !== getCurrentVideoId()
        ) {
            redirectToReplacementVideo(replacementVideoRedirectURL)
        }
        if (currentIndex + 1 === replacementVideoIndex) {
            const video = document.querySelector('video')

            const handleRedirectEventListener = event => {
                if (event.target.currentTime + 3 >= event.target.duration) {
                    redirectToReplacementVideo(replacementVideoRedirectURL)
                    video.removeEventListener(
                        'timeupdate',
                        handleRedirectEventListener,
                    )
                }
            }
            video.addEventListener('timeupdate', handleRedirectEventListener)
        }
    })
}

const handleUnplayableVideoDomUpdates = playlistData => {
    Object.keys(playlistData).forEach(playlistIndex => {
        const replacementVideoIndex = parseInt(playlistIndex)
        const replacementVideoData = playlistData[playlistIndex]

        const title = replacementVideoData.title
        const thumbnailUrl = replacementVideoData.thumbnailUrl
        const url = `/watch?v=${
            replacementVideoData.videoId
        }&list=${getPlaylistId()}&index=${replacementVideoIndex}`

        const unplayableVideoElement = document.querySelectorAll('span#index')[
            replacementVideoIndex - 1
        ]
        const container = unplayableVideoElement.closest('div#container')
        container.style = 'border:1px solid green'
        container.closest('a').href = url
        container.querySelector('a#thumbnail').href = url
        container.querySelector(
            'img#img',
        ).parentElement.style = `background: url("${thumbnailUrl}"); height: 100%; width: 100%; background-size: cover;background-position: center;`
        container.querySelector('img#img').style = `display:none`

        container.querySelector('span#video-title').innerText = title
        container.querySelector('#unplayableText').style = 'display:none'
    })
}
