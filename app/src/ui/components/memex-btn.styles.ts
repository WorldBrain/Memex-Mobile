import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CD9A6',
        borderRadius: 25,
        width: '85%',
        maxHeight: 50,
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
        fontSize: 40,
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
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
