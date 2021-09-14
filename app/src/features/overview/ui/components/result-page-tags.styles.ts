import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('window')
const aspectRatio = height / width

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
        width: '100%',
        flexWrap: 'wrap',
        lineHeight: 30,
        marginTop: 10,
    },
    tagPill: {
        marginRight: 5,
        marginTop: 5,
        backgroundColor: '#67B3E3',
        color: '#3A2F45',
        borderRadius: 4,
        paddingVertical: height > 1000 ? 3 : 2,
        paddingHorizontal: height > 1000 ? 10 : 10,
    },
    tagPillText: {
        textAlign: 'center',
        lineHeight: 22,
        fontSize: height > 1000 ? '0.7rem' : '1rem',
    },
})
