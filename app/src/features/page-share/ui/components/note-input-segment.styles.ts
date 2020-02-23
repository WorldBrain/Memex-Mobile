import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    textInput: {
        height: '100%',
        width: '100%',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: 20,
        color: '$textColor',
        fontWeight: '500',
        fontSize: '1.2rem',
    },
})
