import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    loadingBallContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingBalls: {
        bottom: 20,
    },
    searchContainer: {},
    listContainer: {
        height: '85%',
        marginTop: '0.3rem',
    },
    resultContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
    loadingText: {
        fontFamily: 'Poppins',
        fontWeight: '700',
        color: '$textColor',
        fontSize: '1.3rem',
        marginTop: '1rem',
    },
})
