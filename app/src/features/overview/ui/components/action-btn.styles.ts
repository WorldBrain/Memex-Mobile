import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    actionBtn: {
        padding: '0.4rem',
        width: '4rem',
    },
    icon: {
        opacity: 0.8,
        height: '1rem',
    },
    iconDisabled: {
        opacity: 0.1,
    },
    actionBarBtn: {
        width: '5rem',
    },
    commentIcon: {
        opacity: 1,
        height: '70%',
        width: '2rem',
        padding: 0,
    },
    marginBottom10: {
        height: 10,
    },
    subText: {
        fontSize: height > 1000 ? '0.7rem' : '0.7rem',
        color: 'white',
        fontWeight: '500',
        width: '100%',
        textAlign: 'center',
    },
    actionBtnContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
})
