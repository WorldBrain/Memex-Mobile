import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'

export default EStyleSheet.create({
    container: {
        fontFamily: 'Poppins',
        top: Platform.OS === 'ios' ? 20 : 0,
        width: '100%',
        paddingHorizontal: '1.3rem',
        paddingBottom: '1%',
        paddingTop: '1.3rem',
        minHeight: '3.5rem',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    btnContainer: {
        marginBottom: 5,
        height: '1.7rem',
        width: '3rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
    },
    logoContainer: {
        height: '1.7rem',
        width: '3rem',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
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
    settingsIcon: {
        height: '60%',
        width: '100%',
    },
    logoIcon: {
        height: '100%',
        width: '100%',
    },
})
