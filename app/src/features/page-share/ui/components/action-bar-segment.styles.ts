import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'

const { height, width } = Dimensions.get('screen')
const aspectRatio = height / width

export default EStyleSheet.create({
    placeholderBtn: {
        color: 'white',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: '1.5rem',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
        height: height > 1000 ? '2rem' : '4rem',
        width: '100%',
        marginBottom: '0.5rem',
    },
    buttonText: {
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
        color: '#007AFF',
    },
    buttonContainerRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    buttonContainerLeft: {
        flex: 1,
        alignItems: 'flex-start',
    },
    buttonTextDisabled: {
        fontSize: '1.3rem',
        color: '#C4C4C4',
    },
    mainContent: {
        flex: 4,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    bannerSegmentContainer: {
        backgroundColor: '#e4e4e4',
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
    },
    bannerSegment: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    bannerSegmentText: {
        fontSize: height > 1000 ? '0.8rem' : '1.2rem',
    },
    bannerSegmentTextBold: {
        fontWeight: 'bold',
    },
})
