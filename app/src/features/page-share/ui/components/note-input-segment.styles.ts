import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 3,
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    textInput: {
        height: '100%',
        width: '100%',
        paddingTop: 15,
        paddingBottom: 10,
        paddingHorizontal: height > 1000 ? '1.5rem' : '1.5rem',
        color: '$textColor',
        fontWeight: '500',
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
    },
})
