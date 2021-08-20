import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'column',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingVertical: 100,
    },
    textContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    icon: {
        marginTop: 50,
        width: 50,
        height: 50,
    },
    successIcon: {
        width: 50,
        height: 50,
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 15,
        paddingHorizontal: 50,
        textAlign: 'center',
    },
    backBtn: {
        position: 'absolute',
        top: 50,
        left: 20,
    },
})
