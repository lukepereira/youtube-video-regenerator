/*global chrome*/

import {
    getCurrentIndex,
    getCurrentVideoId,
    getPlaylistId,
    getUrlParams,
    convertArrayToChunks,
    waitForElementToDisplay,
    debounce,
} from './helpers'

import { ACTIONS } from './actions'

import {
    getPlaylistDataFromArchiveApi,
    getPlaylistDataFromWebSearchApi,
    getPlaylistDataFromLocalStorage,
    storePlaylistDataInLocalStorage,
    redirectToReplacementVideo,
} from './messages'

import { CONFIDENCE_RATINGS, CONFIDENCE_COLOUR_MAP } from './constants'

export const runPlaylistScript = () => {
    const playlistId = getPlaylistId()
    if (!playlistId || window.location.pathname.split('/')[1] !== 'watch') {
        return
    }

    getPlaylistDataFromLocalStorage(playlistId)
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (ACTIONS.DEBUG) {
        console.log('content_script action ' + request.type, request.payload)
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
        if (notFoundResponse.length) {
            getPlaylistDataFromWebSearchApi(notFoundResponse)

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

const getReplacementVideoRedirectURL = (replacementVideoData, index) => {
    const videoId = replacementVideoData.videoId
    const playlistId = getPlaylistId()
    return `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}&index=${index}`
}

const handleUnplayableVideoRedirect = playlistData => {
    const currentIndex = getCurrentIndex()
    playlistData.forEach(replacementVideoData => {
        if (
            !replacementVideoData ||
            !replacementVideoData.videoId ||
            replacementVideoData.confidence === CONFIDENCE_RATINGS.LOW
        ) {
            return
        }

        const replacementVideoIndex = parseInt(replacementVideoData.index)

        const replacementVideoRedirectURL = getReplacementVideoRedirectURL(
            replacementVideoData,
            replacementVideoIndex,
        )

        if (
            currentIndex === replacementVideoIndex &&
            replacementVideoData.videoId !== getCurrentVideoId()
        ) {
            redirectToReplacementVideo(replacementVideoRedirectURL)
        } else if (currentIndex + 1 === replacementVideoIndex) {
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
        } else if (
            currentIndex === replacementVideoIndex &&
            replacementVideoData.videoId === getCurrentVideoId()
        ) {
            const video = document.querySelector('video')
            const nextVideoURL = getNextPlaylistVideoURL(currentIndex)
            const handleRedirectEventListener = event => {
                if (event.target.currentTime + 3 >= event.target.duration) {
                    redirectToReplacementVideo(nextVideoURL)
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
    playlistData.forEach(replacementVideoData => {
        if (
            !replacementVideoData ||
            !replacementVideoData.videoId ||
            replacementVideoData.confidence === CONFIDENCE_RATINGS.LOW
        ) {
            return
        }

        const replacementVideoIndex = parseInt(replacementVideoData.index)

        const title = replacementVideoData.title
        const thumbnailUrl = replacementVideoData.thumbnailUrl
        const url = `/watch?v=${
            replacementVideoData.videoId
        }&list=${getPlaylistId()}&index=${replacementVideoIndex}`

        const unplayableVideoElement = document.querySelectorAll('span#index')[
            replacementVideoIndex - 1
        ]
        const container = unplayableVideoElement.closest('div#container')

        container.style = getBorderStyle(replacementVideoData)

        container.closest('a').href = url
        container.querySelector('a#thumbnail').href = url
        container.querySelector(
            'img#img',
        ).parentElement.style = `background: url("${thumbnailUrl}"); height: 100%; width: 100%; background-size: cover;background-position: center;`
        container.querySelector('img#img').style = `display:none`

        container.querySelector('span#video-title').innerText = title
        container.querySelector('#unplayableText').style = 'display:none'

        container.onclick = () =>
            (window.location = `https://www.youtube.com/${url}`)
    })
}

const getNextPlaylistVideoURL = currentIndex => {
    const nextVideo = document.querySelectorAll('span#index')[
        parseInt(currentIndex)
    ]
    const container = nextVideo.closest('div#container')
    return container.closest('a').href
}

const getBorderStyle = replacementVideoData => {
    const borderColour = CONFIDENCE_COLOUR_MAP[replacementVideoData.confidence]
    return `border: 2px solid ${borderColour}; border-radius: 20px`
}
