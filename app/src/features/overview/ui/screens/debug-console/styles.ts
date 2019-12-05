import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContent: {
        flex: 1,
        flexDirection: 'column',
        top: 30,
    },
    logContainer: {
        flex: 5,
        flexDirection: 'column',
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logEntry: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'flex-start',
    },
    logEntryDate: {
        fontFamily: 'Courier New',
        fontSize: 20,
        fontWeight: 'bold',
        marginTop: 15,
    },
    logEntryText: {
        fontFamily: 'Courier New',
        fontSize: 20,
    },
})
