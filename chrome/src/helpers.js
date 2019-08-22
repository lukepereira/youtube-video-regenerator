export const getPlaylistId = () => {
    return getUrlParams('list')
}

export const getCurrentIndex = () => {
    return parseInt(getUrlParams('index'))
}

export const getCurrentVideoId = () => {
    return getUrlParams('v')
}

export const getUrlParams = (parameter, url = window.location.href) => {
    const vars = {}
    const parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value
    })
    return vars[parameter] || ''
}

export const convertArrayToChunks = (list, chunkSize = 10) => {
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

export const waitForElementToDisplay = (selector, callback) => {
    if (document.querySelector(selector) != null) {
        return callback(document.querySelector(selector))
    } else {
        setTimeout(function() {
            waitForElementToDisplay(selector, 1000)
        }, callback)
    }
}
