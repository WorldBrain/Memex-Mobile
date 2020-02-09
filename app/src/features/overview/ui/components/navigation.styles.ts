import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        top: 30,
        maxHeight: 50,
        width: '100%',
        padding: 25,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    btnContainer: {
        flex: 1,
    },
    text: {
        flex: 10,
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        marginTop: 55,
        height: 80,
        width: '100%',
    },
    emptyView: {
        width: '10%',
    },
    settingsIcon: {
        marginRight: 10,
        height: 20,
        marginVertical: 30,
        width: '10%',
    },
})
