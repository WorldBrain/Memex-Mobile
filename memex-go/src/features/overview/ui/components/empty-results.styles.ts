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
        textAlign: 'center',
        fontWeight: '700',
        marginBottom: 10,
        marginTop: 40,
        color: '$textColor',
    },
    subText: {
        color: '$purpleColor',
    },
    linkText: {
        textDecorationLine: 'underline',
    },
})
