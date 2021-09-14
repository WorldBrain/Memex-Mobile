import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'white',
        justifyContent: 'flex-start',
        position: 'absolute',
        left: '2%',
        right: '2%',
        top: 0,
        bottom: 200,
        borderRadius: 10,
        height: '50%',
    },
    stretched: {
        bottom: 20,
    },
    modal: {
        backgroundColor: 'transparent',
    },
    loadingBalls: {
        width: '5rem',
        display: 'flex',
        justifyContent: 'center',
    },
})
