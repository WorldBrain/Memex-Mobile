import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        backgroundColor: '#667BCC',
        width: '100%',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '1.3rem',
        paddingRight: '1.1rem',
        paddingVertical: '0.5rem',
        flexDirection: 'row',
    },
    actionBarItems: {
        display: 'flex',
        flexDirection: 'row',
    },
    leftText: {
        color: 'white',
    },
})
