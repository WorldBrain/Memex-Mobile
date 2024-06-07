import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    favIcon: {},
    contentBox: {
        display: 'flex',
        justifyContent: 'center',
    },
    title: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    titleText: {
        fontWeight: '700',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '1.1rem',
        letterSpacing: 0.6,
        flexWrap: 'wrap',
        overflow: 'hidden',
        color: '#3A2F45',
        marginBottom: 5,
    },
    linkText: {
        color: '#3A2F45',
        letterSpacing: 0.6,
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '1rem',
    },
    date: {
        color: '#3A2F45',
        opacity: 0.7,
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '1rem',
        marginLeft: 10,
    },
    bottomBarBox: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    pdfIcon: {
        fontSize: '0.8rem',
        fontWeight: '500',
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: 5,
        paddingHorizontal: 7,
        marginRight: 10,
    },
})
