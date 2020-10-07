import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    button: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#5CD9A6',
        borderRadius: 25,
        width: '85%',
        maxHeight: '3.5rem',
        paddingHorizontal: 20,
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
        fontSize: '3rem',
        textAlignVertical: 'center',
    },
    text: {
        color: 'white',
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: '1.3rem',
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
