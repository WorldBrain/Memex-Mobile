import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

const ConditionToSizeMap = {
    tabletLandscape: '0.6rem',
    phonePortrait: '1.3rem',
    tabletPortrait: '0.8rem',
}

export default EStyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    textInput: {
        height: '100%',
        width: '100%',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        color: '$textColor',
        fontWeight: '500',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
    },
})
