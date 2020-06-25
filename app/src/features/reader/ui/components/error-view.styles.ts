import { Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 100,
    },
    details: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
})
