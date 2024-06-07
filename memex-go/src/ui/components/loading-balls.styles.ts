import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        position: 'relative',
        width: 80,
        display: 'flex',
        alignItems: 'center',
    },
    ball: {
        position: 'absolute',
        backgroundColor: '#99879F',
        borderRadius: 25,
        width: 15,
        height: 15,
        opacity: 0.7,
        top: '50%',
        bottom: '50%',
    },
})
