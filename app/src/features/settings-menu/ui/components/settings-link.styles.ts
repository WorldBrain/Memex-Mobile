import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        minWidth: height > 1000 ? '50%' : '75%',
        borderBottomColor: '#E0E0E0',
        borderBottomWidth: 1,
    },
    containerNoBorder: {
        minWidth: height > 1000 ? '50%' : '75%',
    },
    link: {
        paddingVertical: 15,
        textDecorationLine: 'none',
        color: '$textColor',
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
    },
})
