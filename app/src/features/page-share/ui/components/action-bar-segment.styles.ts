import { Dimensions, Platform } from 'react-native'
import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

export default EStyleSheet.create({
    placeholderBtn: {
        color: 'white',
    },
    container: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal:
            conditionalStyles() === 'tabletLandscape'
                ? '0.8rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1rem'
                : '1.5rem',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
        height:
            conditionalStyles() === 'tabletLandscape'
                ? '1.3rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '2rem'
                : '4rem',
        width: '100%',
        marginBottom: '0.5rem',
    },
    buttonText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
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
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.1rem',
    },
    bannerSegmentTextBold: {
        fontWeight: 'bold',
    },
})
