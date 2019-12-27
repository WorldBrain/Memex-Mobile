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
    buttonWarn: {
        backgroundColor: '#FF000F',
    },
    buttonEmpty: {
        backgroundColor: 'transparent',
    },
    buttonSmallWidth: {
        maxWidth: '25%',
    },
    buttonHidden: {
        backgroundColor: 'transparent',
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
})
