import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
    instructionText: {
        position: 'relative',
        top: '5rem',
        fontSize: '1.5rem',
        lineHeight: '2rem',
        textAlign: 'center',
        marginLeft: '7%',
        marginRight: '7%',
    },
    mainImgContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        top: '4rem',
    },
    mainImg: {
        width: '90%',
        height: '80%',
        marginRight: '8rem',
        marginLeft: '8rem',
        marginTop: '5rem',
        display: 'flex',
        justifyContent: 'center',
    },
})
