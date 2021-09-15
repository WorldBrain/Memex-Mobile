import { Dimensions, Platform } from 'react-native'
import conditionalStyles from 'src/utils/device-size-helper'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    actionBtn: {
        padding: '0.4rem',
    },
    icon: {
        opacity: 0.8,
        height:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
    },
    iconDisabled: {
        opacity: 0.1,
    },
    actionBarBtn: {
        width: '4.5rem',
    },
    commentIcon: {
        opacity: 1,
    },
    marginBottom10: {
        height: 10,
    },
    subText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '0.9rem',
        color: 'white',
        fontWeight: '500',
        width: '100%',
        textAlign: 'center',
        overflow: 'visible',
    },
    actionBtnContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '5rem',
    },
})
