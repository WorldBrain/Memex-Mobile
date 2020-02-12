import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        position: 'absolute',
        height: '100%',
        width: '65%',
        right: 0,
        padding: 30,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        borderLeftWidth: 1,
        borderLeftColor: '#eaeae9',
        backgroundColor: 'white',
    },
    backIcon: {
        width: 10,
        height: 20,
        marginVertical: 30,
    },
    item: {
        marginVertical: 15,
    },
    itemText: {
        fontSize: 14,
    },
})
