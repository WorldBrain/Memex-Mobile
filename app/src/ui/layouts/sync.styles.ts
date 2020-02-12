import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    titleText: {
        position: 'absolute',
        top: '10%',
        fontSize: '2rem',
        width: '70%',
        textAlign: 'center',
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    subtitleText: {
        position: 'relative',
        top: '1rem',
        fontSize: '1rem',
        marginBottom: '2rem',
        marginTop: '2rem',
        marginHorizontal: '3rem',
        textAlign: 'center',
    },
    children: {
        display: 'flex',
        flex: 1,
        alignItems: 'center',
        position: 'absolute',
        top: '10%',
        height: '50%',
    },
    cancelButton: {
        position: 'relative',
    },
    buttonContainer: {
        position: 'absolute',
        bottom: '10%',
        width: '100%',
        height: '30%',
        display: 'flex',
        flexDirection: 'column-reverse',
        alignItems: 'center',
    },
})
