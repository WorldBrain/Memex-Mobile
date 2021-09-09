import { Platform, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    background: {
        backgroundColor: '#fff',
    },
    btnContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width:
            Platform.OS === 'ios' ? (aspectRatio > 1.6 ? null : '85%') : null,
    },
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        alignItems: 'center',
        position: 'absolute',
        bottom: '5%',
        height: Platform.OS === 'ios' ? (aspectRatio > 1.6 ? 100 : 100) : 100,
    },
})
