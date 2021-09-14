import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

export default EStyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop:
            conditionalStyles() === 'tabletLandscape'
                ? '0rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '2rem'
                : '5rem',
    },
    imgContainer: {
        flex: 3,
        flexDirection: 'column',
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        maxHeight: '55%',
    },
    textContainer: {
        position: 'relative',
        flex: 1,
        flexDirection: 'column',
        width: '90%',
        textAlign: 'center',
        alignItems: 'center',
        marginBottom: '2rem',
    },
    headingText: {
        position: 'relative',
        fontWeight: 'bold',
        color: '$textColor',
        textAlign: 'center',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '2rem',
        width: '100%',
    },
    secondaryText: {
        position: 'relative',
        color: '#a1a1a1',
        textAlign: 'center',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.1rem'
                : '1.3rem',
        top:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.3rem'
                : '1.3rem',
        lineHeight:
            conditionalStyles() === 'tabletLandscape'
                ? '0.6rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.8rem'
                : '2.3rem',
    },
})
