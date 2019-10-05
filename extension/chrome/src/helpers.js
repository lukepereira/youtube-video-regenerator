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

export const waitForElementToDisplay = selector => {
    return new Promise((resolve, reject) => {
        let el = document.querySelector(selector)
        if (el) {
            resolve(el)
        } else {
            new MutationObserver((mutationRecords, observer) => {
                Array.from(document.querySelectorAll(selector)).forEach(
                    element => {
                        resolve(element)
                        observer.disconnect()
                    },
                )
            }).observe(document.documentElement, {
                childList: true,
                subtree: true,
            })
        }
    })
}

export const debounce = (func, wait, immediate) => {
    var timeout

    return function executedFunction() {
        var context = this
        var args = arguments

        var later = function() {
            timeout = null
            if (!immediate) func.apply(context, args)
        }

        var callNow = immediate && !timeout

        clearTimeout(timeout)

        timeout = setTimeout(later, wait)

        if (callNow) func.apply(context, args)
    }
}
