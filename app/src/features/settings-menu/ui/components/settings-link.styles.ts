import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        minWidth: '75%',
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },
    link: {
        paddingVertical: 15,
        textDecorationLine: 'none',
        color: '$textColor',
        fontSize: '1.25rem',
    },
})
