import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        width:
            conditionalStyles() === 'tabletLandscape'
                ? '2rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '4rem'
                : '6rem',
    },
    ballSelected: {
        backgroundColor: '#36362f',
    },
    ball: {
        backgroundColor: '#c4c4c4',
        borderRadius: 25,
        width:
            conditionalStyles() === 'tabletLandscape'
                ? '0.4rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        height:
            conditionalStyles() === 'tabletLandscape'
                ? '0.4rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
    },
})
