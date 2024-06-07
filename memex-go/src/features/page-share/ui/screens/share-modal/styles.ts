import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    titleText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})
