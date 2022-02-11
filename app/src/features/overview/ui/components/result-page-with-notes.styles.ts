import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'
import { Column } from 'typeorm'

export default EStyleSheet.create({
    notesDropdown: {},
    noResultsContainer: {
        width: '100%',
        padding: '5%',
        alignItems: 'center',
        display: 'flex',
    },
    noResultsTitle: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.7rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '1rem'
                : '1.5rem',
        marginBottom: '0.5rem',
        marginTop: '5%',
        fontWeight: '700',
        color: '$textColor',
    },
    noResultsSubTitle: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.8rem'
                : '1.3rem',
        fontWeight: '500',
        color: '#a2a2a2',
        textAlign: 'center',
    },
    list: {
        width: '96%',
        flexDirection: 'column',
        flexGrow: 1,
        flex: 1,
        alignContent: 'stretch',
        height: '80%',
    },
    link: {
        textDecorationLine: 'underline',
        fontWeight: '600',
    },
})
