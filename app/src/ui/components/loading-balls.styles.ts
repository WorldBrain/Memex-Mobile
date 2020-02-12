import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        position: 'relative',
        width: 80,
    },
    ball: {
        position: 'absolute',
        backgroundColor: '#c4c4c4',
        borderRadius: 25,
        width: 15,
        height: 15,
        top: '50%',
        bottom: '50%',
    },
})
