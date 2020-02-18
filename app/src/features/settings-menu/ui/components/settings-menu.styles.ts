import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    mainContainer: {
        flex: 10,
        marginTop: 50,
        alignItems: 'center',
    },
    footerContainer: {
        flex: 3,
        alignItems: 'center',
    },
    linksContainer: {
        flex: 1,
        flexDirection: 'column',
        marginTop: 20,
    },
    versionText: {
        position: 'absolute',
        textAlign: 'center',
        fontSize: 15,
        bottom: 15,
    },
})
