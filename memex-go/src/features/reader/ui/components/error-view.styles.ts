import { Platform, Dimensions } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import { theme } from 'src/ui/components/theme/theme'

const { height } = Dimensions.get('window')
const actionBarHeight = 80

export default EStyleSheet.create({
    container: {
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: theme.colors.black,
        paddingVertical: 100,
        height: height - actionBarHeight,
        paddingTop: height > 1000 ? 20 : 40,
        width: '100%',
    },
    details: {
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
})
