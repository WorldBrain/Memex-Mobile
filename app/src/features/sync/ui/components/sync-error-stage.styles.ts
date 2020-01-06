import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    errorTextContainer: {
        marginBottom: 30,
    },
    helpContainer: {
        // flex: 1,
        // minWidth: '100%',
    },
    titleText: {
        top: 30,
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
    },
    helpHeader: {
        textTransform: 'uppercase',
        fontSize: 13,
        marginLeft: 15,
        color: '#bdbdbf',
        lineHeight: 28,
    },
    helpEntry: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        minWidth: '100%',
        maxWidth: '100%',
        maxHeight: 50,
    },
    helpEntryText: {
        fontSize: 17,
        marginLeft: 15,
        // lineHeight: 22,
    },
    helpEntryArrow: {
        color: '#c5c5c7',
        fontSize: 17,
        marginRight: 15,
        fontWeight: '600',
    },
    spinner: {
        marginBottom: 50,
    },
    icon: {
        width: 50,
        height: 50,
        backgroundColor: '#c4c4c4',
    },
    errorText: {
        fontSize: 18,
        color: 'black',
        textAlign: 'center',
    },
})
