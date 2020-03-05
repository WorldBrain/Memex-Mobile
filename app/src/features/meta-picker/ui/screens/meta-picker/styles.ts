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
    searchContainer: {
        height: 'fit-content',
    },
    listContainer: {
        height: '85%',
        marginTop: '0.3rem',
    },
    resultContainer: {
        display: 'flex',
        flexDirection: 'column',
    },
})
