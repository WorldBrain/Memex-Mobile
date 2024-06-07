import EStyleSheet from 'react-native-extended-stylesheet'
import conditionalStyles from 'src/utils/device-size-helper'

export default EStyleSheet.create({
    container: {
        padding: '1.2rem',
        width: '100%',
    },
    noteText: {
        marginBottom: 5,
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1.1rem',
        overflow: 'hidden',
        color: '#3A2F45',
        lineHeight: 20,
    },
    text: {
        backgroundColor: '#93fed7',
        paddingHorizontal: 10,
    },
    commentText: {
        marginBottom: 10,
        color: '#3A2F45',
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1.1rem',
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1.1rem',
        color: '#3A2F45',
    },
    lastEdited: {
        fontSize:
            conditionalStyles() === 'tabletLandscape'
                ? '0.5rem'
                : conditionalStyles() === 'tabletPortrait'
                ? '0.6rem'
                : '1.1rem',
        color: 'black',
        marginRight: 5,
    },
})
