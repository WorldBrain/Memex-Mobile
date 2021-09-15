import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    loadingBallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBalls: {
        bottom: 20,
    },
    searchContainer: {
        width: '100%',
    },
    listContainer: {
        height: '100%',
        marginTop:
            conditionalStyles() === 'tabletLandscape'
                ? '0.1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.1rem'
                : '0.3rem',
    },
    resultContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    loadingText: {
        fontFamily: 'Poppins',
        fontWeight: '700',
        color: '$textColor',
        fontSize: '1.3rem',
        marginTop: '1rem',
    },
})
