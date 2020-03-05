import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    placeholderBtn: {
        color: 'white',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1.5rem',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
        height: '4rem',
        width: '100%',
        marginBottom: '0.5rem',
    },
    buttonText: {
        fontSize: '1.3rem',
        color: '#007AFF',
    },
    buttonContainerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    buttonContainerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    buttonTextDisabled: {
        fontSize: '1.3rem',
        color: '#C4C4C4',
    },
    mainText: {
        fontSize: '1.3rem',
        fontWeight: 'bold',
        textAlign: 'center',
        flex: 4,
    },
})
