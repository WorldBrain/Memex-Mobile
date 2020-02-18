import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    favIcon: {},
    contentBox: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    title: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        overflow: 'hidden',
    },
    titleText: {
        fontWeight: '700',
        fontSize: '1.1rem',
        letterSpacing: 0.6,
        flexWrap: 'wrap',
        overflow: 'hidden',
        color: '#3A2F45',
        marginBottom: '0.1rem',
        fontFamily: 'Poppins',
    },
    linkText: {
        color: '#3A2F45',
        letterSpacing: 0.6,
        fontSize: '1.1rem',
        marginBottom: '0.3rem',
    },
})
