import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    mainText: {
        fontWeight: '700',
        fontSize: 18,
        marginVertical: 25,
        lineHeight: '2rem',
        paddingHorizontal: 60,
        textAlign: 'center',
    },
    reportBtn: {},
    errMsg: {
        marginVertical: 25,
        color: '#FC0C0C',
        fontSize: 16,
    },
})
