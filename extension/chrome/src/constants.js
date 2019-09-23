export const CONFIDENCE_RATINGS = Object.freeze({
    HIGH: 'HIGH',
    MEDIUM: 'MEDIUM',
    LOW: 'LOW',
})

export const CONFIDENCE_COLOUR_MAP = Object.freeze({
    [CONFIDENCE_RATINGS.HIGH]: 'green',
    [CONFIDENCE_RATINGS.MEDIUM]: 'orange',
    [CONFIDENCE_RATINGS.LOW]: 'red',
})
