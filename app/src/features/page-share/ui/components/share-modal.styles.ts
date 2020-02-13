import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        position: 'absolute',
        left: '2%',
        right: '2%',
        top: '0rem',
        bottom: 200,
        borderRadius: 10,
        height: '50%',
    },
    stretched: {
        bottom: 20,
    },
    modal: {
        backgroundColor: 'transparent',
    },
})
