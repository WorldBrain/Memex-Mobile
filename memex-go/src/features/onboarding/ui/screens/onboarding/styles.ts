import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    mainImg: {
        width: '90%',
        height: '80%',
        marginRight: '8rem',
        marginLeft: '8rem',
        marginTop: height > 1000 ? '0rem' : '1.2rem',
    },
})
