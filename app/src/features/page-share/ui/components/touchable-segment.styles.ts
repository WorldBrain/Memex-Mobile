import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1.5rem',
    },
    outter: {
        flex: 1,
        justifyContent: 'center',
    },
    mainText: {
        color: '#3a2f45',
        fontWeight: '600',
        fontSize: '1.2rem',
        fontFamily: 'Poppins',
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    starIcon: {
        width: '1.3rem',
        height: '1.3rem',
    },
})
