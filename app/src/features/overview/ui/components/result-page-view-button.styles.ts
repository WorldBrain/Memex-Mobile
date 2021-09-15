import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    favIcon: {},
    touchContainer: {
        flexDirection: 'column',
    },
    contentContainer: {
        flexDirection: 'column',
        paddingVertical:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1rem',
        flex: 1,
        paddingLeft: '1.3rem',
    },
    resultContainer: {
        flexDirection: 'row',
        maxWidth: '100%',
        justifyContent: 'space-between',
    },
    actionContainer: {
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
        paddingTop:
            conditionalStyles() === 'tabletLandscape'
                ? '0.1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.5rem'
                : '0.6rem',
        paddingRight: height > 1000 ? '0.2rem' : '0.5rem',
        flexDirection: 'row',
    },
    tagContainer: {
        marginTop: '0.6rem',
    },
    ActionButtonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    VisitButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        height: '100%',
        justifyContent: 'center',
    },
})
