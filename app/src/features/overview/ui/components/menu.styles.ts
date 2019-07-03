import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        paddingHorizontal: 20,
        marginTop: 40,
        maxHeight: 40,
    },
    mainContainerBtm: {
        borderBottomWidth: 1.5,
        borderBottomColor: '#f2f2f2',
        maxHeight: 80,
    },
    topContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 100,
    },
    bottomContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    collectionsText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
})
