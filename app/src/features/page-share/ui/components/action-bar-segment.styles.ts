import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    placeholderBtn: {
        color: 'white',
    },
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1.5rem',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
        height: '4rem',
    },
    buttonText: {
        fontSize: '1.3rem',
        color: '#007AFF',
    },
    buttonTextDisabled: {
        fontSize: '1.3rem',
        color: '#C4C4C4',
    },
    mainText: {
        fontSize: '1rem',
        fontWeight: 'bold',
    },
})
