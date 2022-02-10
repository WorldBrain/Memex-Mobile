import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1.5rem',
    },
    outter: {
        flex: 1,
        justifyContent: 'center',
    },
    mainText: {
        color: '#3a2f45',
        fontWeight: '600',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        fontFamily: 'Inter',
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
})
