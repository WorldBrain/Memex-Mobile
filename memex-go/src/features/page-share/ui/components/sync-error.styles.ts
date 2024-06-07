import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    mainText: {
        fontWeight: '700',
        fontSize: 20,
        marginTop: 10,
        lineHeight: '2rem',
        paddingHorizontal: 60,
        textAlign: 'center',
    },
    subText: {
        fontWeight: '400',
        fontSize: 16,
        marginVertical: 10,
        marginBottom: 20,
        lineHeight: '1.5rem',
        paddingHorizontal: 20,
        textAlign: 'center',
    },
    reportBtn: {},
    errMsgTitle: {
        fontWeight: '600',
        fontSize: 16,
        marginVertical: 10,
    },
    scrollView: {
        backgroundColor: 'pink',
        marginHorizontal: 20,
    },
    errMsg: {
        marginVertical: 25,
        color: '#FC0C0C',
        fontSize: 16,
    },
})
