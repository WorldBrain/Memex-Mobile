import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        paddingHorizontal: '1.5rem',
    },
    containerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    entry: {
        paddingHorizontal: '1rem',
        paddingVertical: '0.3rem',
        borderRadius: 5,
    },
    entryBackground: {
        backgroundColor: '#83c9f4',
    },
    entryText: {
        fontSize: '1.4rem',
        color: '$textColor',
        fontWeight: '400',
    },
    emptyRowText: {
        width: '100%',
        textAlign: 'center',
        fontSize: '1.4rem',
        color: '$textColor',
    },
    addText: {
        fontSize: '1.2rem',
        fontWeight: 'bold',
    },
    checkMarkContainer: {
        width: '2.2rem',
        height: 'auto',
        padding: '0.3rem',
    },
    checkmark: {
        width: '100%',
        height: '100%',
    },
    checkmarkHidden: {
        display: 'none',
    },
})
