import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        fontFamily: 'Poppins',
        top: Platform.OS === 'ios' && height < 1000 ? 20 : 0,
        width: '100%',
        height: height > 1000 ? '1rem' : '0.7rem',
        paddingVertical: height > 1000 ? '0.5rem' : '1rem',
        marginTop: height > 1000 ? '0.5rem' : '0.8rem',
        maxHeight: height > 1000 ? '2.5rem' : '4rem',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
        borderBottomColor: '#DADADA',
        borderBottomWidth: 1,
    },
    rightBtnContainer: {
        height: height > 1000 ? '3.5rem' : '4rem',
        width: '15%',
        display: 'flex',
        justifyContent: 'center',
    },
    leftBtnContainer: {
        height: height > 1000 ? '3.5rem' : '4rem',
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
        fontSize: height > 1000 ? '0.8rem' : '1.3rem',
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
    disabled: {
        display: 'none',
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
