import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    background: {
        backgroundColor: '#fff',
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
        height: 100,
    },
})
