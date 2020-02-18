import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    favIcon: {},
    title: {
        textAlign: 'center',
        fontSize: 14,
        fontWeight: '600',
        color: '$textColor',
    },
    container: {
        margin: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    linkText: {
        color: '#72727f',
        fontSize: 14,
        fontWeight: 'normal',
        textDecorationLine: 'underline',
    },
})
