import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        minWidth:
            conditionalStyles() === 'tabletLandscape'
                ? '40%'
                : conditionalStyles() === 'tabletPortrait'
                ? '50%'
                : '80%',
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },
    containerNoBorder: {
        minWidth:
            conditionalStyles() === 'tabletLandscape'
                ? '40%'
                : conditionalStyles() === 'tabletPortrait'
                ? '50%'
                : '80%',
    },
    link: {
        paddingVertical: 15,
        textDecorationLine: 'none',
        color: '$textColor',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
    },
})
