import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CD9A6',
        borderRadius: 25,
        width:
            Platform.OS === 'ios' ? (aspectRatio > 1.6 ? '85%' : '50%') : '85%',
        maxHeight: 60,
        height: 50,
        paddingHorizontal:
            Platform.OS === 'ios' ? (aspectRatio > 1.6 ? 20 : 0) : 20,
    },
    buttonSecondary: {
        backgroundColor: '#5671CF',
    },
    buttonSecondaryDisabled: {
        backgroundColor: '#ced3f7',
    },
    buttonWarn: {
        backgroundColor: '#FF000F',
    },
    buttonDisabled: {
        backgroundColor: '#cef4e4',
    },
    buttonEmpty: {
        backgroundColor: 'transparent',
    },
    buttonSmallWidth: {
        maxWidth: '40%',
    },
    buttonHidden: {
        backgroundColor: 'transparent',
    },
    buttonBigText: {
        color: '#3A2F45',
        fontSize:
            Platform.OS === 'ios'
                ? aspectRatio > 1.6
                    ? '3rem'
                    : '1.8rem'
                : '3rem',
        textAlignVertical: 'center',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        fontWeight: 'bold',
    },
    textWarn: {
        color: 'white',
    },
    textEmpty: {
        color: 'black',
    },
    loading: {
        bottom: 6,
    },
    loadingBall: {
        backgroundColor: '#5671CF',
    },
})
