import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
        padding: '2rem',
        paddingTop: '1rem',
        paddingBottom: 0,
    },
    textInput: {
        height: '100%',
        width: '100%',
        color: '$textColor',
        fontWeight: '500',
        fontStyle: 'italic',
        fontSize: '1.2rem',
    },
})
