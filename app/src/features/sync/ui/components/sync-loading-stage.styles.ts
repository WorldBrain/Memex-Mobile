import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    spinner: {
        marginBottom: 50,
    },
    icon: {
        width: 50,
        height: 50,
    },
    text: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'black',
        textAlign: 'center',
    },
    warningText: {
        fontSize: 25,
        color: 'red',
        marginTop: 15,
    },
})
