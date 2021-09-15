import { Dimensions, Platform } from 'react-native'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

const isLandscape = () => {
    const dim = Dimensions.get('screen')
    return dim.width >= dim.height
}

const conditionalStyles = () => {
    if (height > 750 && isLandscape()) {
        return 'tabletLandscape'
    }

    if (width < 600 && !isLandscape()) {
        return 'phonePortrait'
    }

    if (height > 1000 && !isLandscape()) {
        return 'tabletPortrait'
    }

    return 'phonePortrait'
}

export default conditionalStyles
