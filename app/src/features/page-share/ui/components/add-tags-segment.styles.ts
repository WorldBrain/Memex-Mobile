import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
    },
    count: {
        fontWeight: 'bold',
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
    },
})
