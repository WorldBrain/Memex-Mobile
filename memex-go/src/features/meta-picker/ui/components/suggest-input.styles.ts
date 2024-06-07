import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        marginHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? '0.3rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1rem',
        borderRadius: 5,
        backgroundColor: '#f1f1f1',
    },
    textInput: {
        padding:
            conditionalStyles() === 'tabletLandscape'
                ? '0.3rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1rem',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        color: '#000000',
        fontWeight: '500',
    },
})
