import { StyleSheet, Platform } from 'react-native'

export default StyleSheet.create({
    container: {
        fontFamily: 'Poppins',
        top: Platform.OS === 'ios' ? 30 : 0,
        maxHeight: 60,
        width: '100%',
        paddingHorizontal: 15,
        paddingVertical: 20,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    btnContainer: {
        flex: 1,
        height: 15,
        width: 20,
    },
    logoContainer: {
        flex: 1,
        height: 24,
        width: 24,
    },
    text: {
        flex: 10,
        fontFamily: 'Poppins',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black',
        fontSize: 18,
        marginTop: 55,
        height: 80,
        width: '100%',
    },
    emptyView: {
        flex: 1,
        width: 20,
    },
    settingsIcon: {
        height: '100%',
        width: '100%',
    },
})
