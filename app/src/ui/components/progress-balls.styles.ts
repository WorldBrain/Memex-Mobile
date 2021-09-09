import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width: '3rem',
    },
    ballSelected: {
        backgroundColor: '#36362f',
    },
    ball: {
        backgroundColor: '#c4c4c4',
        borderRadius: 25,
        width: '0.5rem',
        height: '0.5rem',
    },
})
