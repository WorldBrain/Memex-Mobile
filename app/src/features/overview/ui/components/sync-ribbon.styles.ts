import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        position: 'absolute',
        top: '7rem',
        display: 'flex',
        width: '100%',
        alignItems: 'center',
        borderRadius: 30,
        zIndex: 10,
    },
    ribbonButton: {
        backgroundColor: '#5CD9A6',
        paddingVertical: '0.5rem',
        borderRadius: 30,
        paddingHorizontal: '1rem',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    reload: {
        width: 15,
        height: 15,
        marginRight: 10,
    },
    text: {
        textAlign: 'center',
        fontWeight: 'bold',
        fontSize: 14,
        color: '#fff',
    },
})
