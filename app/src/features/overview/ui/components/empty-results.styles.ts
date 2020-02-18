import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    text: {
        fontSize: 18,
        fontFamily: 'Poppins',
        textAlign: 'center',
        fontWeight: '600',
        marginBottom: 10,
        marginTop: 40,
    },
    subText: {
        color: '#83838f',
    },
    linkText: {
        textDecorationLine: 'underline',
    },
})
