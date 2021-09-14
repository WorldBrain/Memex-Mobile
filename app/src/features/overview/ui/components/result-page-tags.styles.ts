import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap',
        lineHeight: 30,
        marginTop: 10,
    },
    tagPill: {
        marginRight: 5,
        marginTop: 5,
        backgroundColor: '#67B3E3',
        color: '#3A2F45',
        borderRadius: 4,
        paddingVertical:
            conditionalStyles() === 'tabletLandscape'
                ? 6
                : conditionalStyles() === 'tabletPortrait'
                ? 3
                : 2,
        paddingHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? 10
                : conditionalStyles() === 'tabletPortrait'
                ? 10
                : 10,
    },
    tagPillText: {
        textAlign: 'center',
        lineHeight: 22,
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '1.2rem',
    },
})
