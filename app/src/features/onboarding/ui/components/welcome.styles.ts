import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    logo: {
        height: 150,
        width: 200,
    },
    mainText: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 18,
    },
    btnContainer: {
        flex: 1,
        justifyContent: 'space-around',
        alignItems: 'center',
        position: 'absolute',
        bottom: 35,
        width: '100%',
        height: 120,
    },
})
