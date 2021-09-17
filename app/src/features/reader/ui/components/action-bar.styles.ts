import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export const actionBarHeight = 80

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#DADADA',
        height:
            conditionalStyles() === 'tabletLandscape'
                ? 50
                : conditionalStyles() === 'tabletPortrait'
                ? 80
                : 70,
        width: '100%',
        paddingBottom:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1rem'
                : '1rem',
        paddingTop:
            conditionalStyles() === 'tabletLandscape'
                ? '0.8rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '0rem',
        paddingHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? '1.8rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.7rem'
                : '1rem',
        backgroundColor: 'white',
    },
    leftBtns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        display: 'flex',
    },
    rightBtns: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: height > 1000 ? '10%' : '50%',
    },
    actionBtn: {
        width: '3rem',
        height: '3rem',
        marginRight: 10,
    },
})
