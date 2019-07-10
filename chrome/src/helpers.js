export const getPlaylistId = () => {
    return getUrlParams('list')
}

export const getCurrentIndex = () => {
    return parseInt(getUrlParams('index'))
}

export const getCurrentVideoId = () => {
    return getUrlParams('v')
}

export const getUrlParams = (parameter, url=window.location.href) => {
    const vars = {}
    const parts = url.replace(/[?&]+([^=&]+)=([^&]*)/gi, (m, key, value) => {
        vars[key] = value;
    })
    return vars[parameter] || ''
}
