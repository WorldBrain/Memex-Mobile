import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    mainContent: {
        height: '100%',
        width: '90%',
        display: 'flex',
        alignItems: 'center',
    },
    memexLogo: {
        flex: 1,
        height: '100%',
        width: '100%',
        marginTop: '20%',
        display: 'flex',
        alignItems: 'center',
    },
    btnsContainer: {
        flex: 2,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '80%',
        bottom: 50,
    },
    btn: {
        marginVertical: 7,
        width: '100%',
    },
    versionText: {
        textAlign: 'center',
    },
    logoImg: {
        flex: 1,
        width: '100%',
        overflow: 'hidden',
    },
    btnLight: {
        backgroundColor: 'white',
        color: 'red',
    },
    footer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '60%',
        bottom: '15%',
    },
})
