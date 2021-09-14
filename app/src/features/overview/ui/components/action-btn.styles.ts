import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    actionBtn: {
        padding: '0.4rem',
    },
    icon: {
        opacity: 0.8,
        height: height > 1000 ? '0.8rem' : '1.3rem',
    },
    iconDisabled: {
        opacity: 0.1,
    },
    actionBarBtn: {
        width: '4.5rem',
    },
    commentIcon: {
        opacity: 1,
        height: height > 1000 ? '1rem' : '1rem',
    },
    marginBottom10: {
        height: 10,
    },
    subText: {
        fontSize: height > 1000 ? '0.6rem' : '0.85rem',
        color: 'white',
        fontWeight: '500',
        width: '100%',
        textAlign: 'center',
        overflow: 'visible',
    },
    actionBtnContainer: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        width: '5rem',
    },
})
