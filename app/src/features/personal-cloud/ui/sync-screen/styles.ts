import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

export default EStyleSheet.create({
    logoIcon: {
        width:
            conditionalStyles() === 'tabletLandscape'
                ? '1.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '2rem'
                : '3rem',
        height:
            conditionalStyles() === 'tabletLandscape'
                ? '1.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '2rem'
                : '3rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop:
            conditionalStyles() === 'tabletLandscape'
                ? '7rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '13rem'
                : '21rem',
    },
    header: {
        marginTop:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '3rem',
    },
    headerText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '2rem',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    body: {
        width: '70%',
        marginTop:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.75rem'
                : '1rem',
        marginBottom:
            conditionalStyles() === 'tabletLandscape'
                ? '1rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1.5rem'
                : '2rem',
    },
    bodyText: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.2rem',
        textAlign: 'center',
        color: '#a2a2a2',
    },
    contentBox: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
})
