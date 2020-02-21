import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        position: 'relative',
        top: '1rem',
        flex: 1,
        width: '100%',
        flexDirection: 'column',
    },
    highlightTextContainer: {
        width: '100%',
    },
    highlightText: {
        backgroundColor: '#93fed7',
        lineHeight: 20,
        marginHorizontal: '1.5rem',
        marginTop: '1.5rem',
        padding: '0.2rem',
        paddingHorizontal: '0.4rem',
        paddingLeft: '0.6rem',
        width: 'auto',
        fontWeight: '600',
        color: '$textColor',
        alignSelf: 'flex-start',
    },
    noteInputContainer: {
        flex: 1,
        padding: '1.5rem',
        maxHeight: '40%',
        borderBottomWidth: 0,
    },
    noteInput: {
        backgroundColor: '#F1F1F1',
        borderRadius: 4,
    },
})
