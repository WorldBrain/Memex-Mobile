import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 4,
        flexDirection: 'column',
        width: '90%',
        margin: 15,
    },
    headContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    countIcon: {
        width: 25,
        height: 25,
        backgroundColor: '#c4c4c4',
    },
    inputContainer: {
        flex: 5,
    },
    textInput: {
        backgroundColor: '#f1f1f1',
        borderRadius: 5,
        padding: 10,
        fontSize: 16,
        height: '100%',
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainText: {
        flex: 1,
        fontSize: 18,
        fontWeight: 'bold',
    },
})
