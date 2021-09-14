import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        marginHorizontal: '1.5rem',
        borderRadius: 5,
        backgroundColor: '#f1f1f1',
    },
    textInput: {
        padding: '1rem',
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
        color: '#000000',
        fontWeight: '500',
    },
})
