import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    outter: {
        flex: 1,
    },
    mainText: {
        color: '#3a2f45',
        fontWeight: '700',
        fontSize: 14,
        fontFamily: 'Poppins',
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    starIcon: {
        width: 15,
        height: 15,
    },
})
