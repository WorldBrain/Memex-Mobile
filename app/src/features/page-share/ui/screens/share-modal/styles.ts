import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    titleText: {
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
})
