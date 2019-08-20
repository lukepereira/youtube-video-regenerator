/*global chrome*/

import { ACTIONS } from './actions'

const sendMessage = message => {
    chrome.runtime.sendMessage({
        ...message,
        actions: ACTIONS,
    })
}

export const getPlaylistDataFromArchiveApi = unplayableVideoData => {
    sendMessage({
        type: ACTIONS.FETCH_ARCHIVED_PLAYLIST_DATA,
        payload: {
            unplayableVideoData,
        },
    })
}

export const getPlaylistDataFromWebSearchApi = unplayableVideoData => {
    sendMessage({
        type: ACTIONS.FETCH_WEB_SEARCHED_PLAYLIST_DATA,
        payload: {
            unplayableVideoData,
        },
    })
}

export const getPlaylistDataFromLocalStorage = playlistId => {
    sendMessage({
        type: ACTIONS.GET_PLAYLIST_DATA_FROM_LOCAL_STORAGE,
        payload: {
            playlistId,
        },
    })
}

export const storePlaylistDataInLocalStorage = (playlistId, playlistData) => {
    sendMessage({
        type: ACTIONS.STORE_PLAYLIST_DATA,
        payload: {
            playlistId,
            playlistData,
        },
    })
}

export const redirectToReplacementVideo = url => {
    sendMessage({
        type: ACTIONS.REDIRECT_TO_URL,
        payload: {
            url,
        },
    })
}
