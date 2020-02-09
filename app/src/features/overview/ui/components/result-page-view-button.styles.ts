import { StyleSheet } from 'react-native'
import { start } from 'repl'

export default StyleSheet.create({
    favIcon: {},
    container: {
        backgroundColor: '#667BCC',
        width: '100%',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 5,
        flexDirection: 'row',
    },
    touchContainer: {
        flexDirection: 'column',
        paddingTop: 20,
        paddingBottom: 20,
        paddingLeft: 20,
    },
    contentContainer: {
        flexDirection: 'column',
        paddingTop: 20,
        flex: 1,
        paddingBottom: 20,
        paddingLeft: 20,
    },
    resultContainer: {
        flexDirection: 'row',
        maxWidth: '100%',
        justifyContent: 'space-between',
    },
    actionContainer: {
        height: '100%',
    },
    date: {
        color: '#3A2F45',
        fontSize: 12,
        marginTop: 5,
    },
    tagContainer: {
        marginTop: 10,
    },
    text: {
        color: 'white',
    },
})
