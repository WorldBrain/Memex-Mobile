import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    checkCircle: {
        height: 34,
        width: 34,
        borderRadius: 25,
        position: 'relative',
        backgroundColor: '#5CD9A6',
    },
    checkCircleDisabled: {
        backgroundColor: '#2C49AB',
    },
    tick: {
        position: 'absolute',
        left: 8,
        top: 11,
    },
})
