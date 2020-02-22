import EStyleSheet from 'react-native-extended-stylesheet'
import { Platform } from 'react-native'

export default EStyleSheet.create({
    container: {
        flex: 1,
        fontFamily: 'Poppins',
        top: Platform.OS === 'ios' ? 20 : 0,
        width: '100%',
        height: '100%',
        paddingVertical: '1rem',
        marginTop: '1rem',
        maxHeight: '4rem',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    rightBtnContainer: {
        height: '4rem',
        width: '15%',
        display: 'flex',
        justifyContent: 'center',
    },
    leftBtnContainer: {
        height: '4rem',
        width: '15%',
        display: 'flex',
        justifyContent: 'center',
    },
    textContainer: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
        width: '70%',
    },
    text: {
        fontFamily: 'Poppins',
        textAlign: 'center',
        fontWeight: 'bold',
        color: '$textColor',
        fontSize: '1.2rem',
    },
    btnContainer: {
        padding: '1.2rem',
    },
    backIcon: {
        width: '90%',
        height: '90%',
    },
    addIcon: {
        width: '90%',
        height: '90%',
    },
    checkIcon: {
        width: '85%',
        height: '85%',
    },
    settingsContainer: {
        position: 'relative',
        height: '85%',
        width: '85%',
    },
    settingsIcon: {
        height: '90%',
        width: '90%',
    },
    logoIcon: {
        height: '100%',
        width: '100%',
    },
})
