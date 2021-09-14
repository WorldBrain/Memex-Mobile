import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        backgroundColor: '#667BCC',
        width: '100%',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: '1rem',
        paddingRight: '1.3rem',
        paddingVertical: height > 1000 ? '0.5rem' : '1.3rem',
        flexDirection: 'row',
    },
    // containerNoLeftSection: {
    //     justifyContent: 'flex-end',
    // },
    actionBarItems: {
        display: 'flex',
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
    },
    leftText: {
        color: 'white',
        fontWeight: '800',
    },
})
