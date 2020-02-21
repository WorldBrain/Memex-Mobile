import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'

export default EStyleSheet.create({
    container: {
        flex: 1,
        fontFamily: 'Poppins',
        top: Platform.OS === 'ios' ? 20 : 0,
        width: '100%',
        padding: '1rem',
        marginTop: '1rem',
        maxHeight: '4rem',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    rightBtnContainer: {
        height: '3rem',
        width: '3rem',
    },
    leftBtnContainer: {
        height: '1.7rem',
        width: '3rem',
    },
    textContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        fontFamily: 'Poppins',
        textAlign: 'center',
        fontWeight: 'bold',
        color: 'black',
        fontSize: '1.2rem',
    },
    emptyView: {
        flex: 1,
        width: 20,
    },
})
