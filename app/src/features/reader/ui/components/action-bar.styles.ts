import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export const actionBarHeight = 70

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#DADADA',
        height: actionBarHeight,
        width: '100%',
        paddingVertical: height > 1000 ? '1rem' : '1rem',
        paddingHorizontal: height > 1000 ? '1rem' : '1rem',
        backgroundColor: 'white',
    },
    leftBtns: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        display: 'flex',
    },
    rightBtns: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        width: height > 1000 ? '10%' : '50%',
    },
    actionBtn: {
        width: '3rem',
        height: '3rem',
        marginRight: 10,
    },
})
