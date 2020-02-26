import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    errorTextContainer: {
        top: '0rem',
        padding: '1.8rem',
        height: '50%',
    },
    helpContainer: {
        top: '14%',
        display: 'flex',
        flexDirection: 'column',
        height: '65%',
    },
    titleText: {
        top: '10%',
        fontSize: 25,
        fontWeight: 'bold',
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
    },
    helpHeader: {
        textTransform: 'uppercase',
        fontSize: 13,
        marginLeft: '2rem',
        color: '#bdbdbf',
        lineHeight: 28,
    },
    helpEntry: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '90%',
    },
    helpEntryText: {
        fontSize: '1.3rem',
        paddingHorizontal: '2rem',
        paddingBottom: '2rem',
        alignItems: 'center',
        textAlign: 'center',
        lineHeight: 25,
    },
    helpEntryArrow: {
        color: '#c5c5c7',
        fontSize: 17,
        marginRight: 15,
        fontWeight: '600',
    },
    spinner: {
        marginBottom: 50,
    },
    icon: {
        width: 50,
        height: 50,
        backgroundColor: '#c4c4c4',
    },
    errorText: {
        fontSize: 16,
        color: '#fe7b7b',
        textAlign: 'center',
    },
    cancelContainer: {
        position: 'relative',
        top: '20%',
        display: 'flex',
        alignItems: 'center',
    },
    cancelButton: {
        textAlign: 'center',
        width: '100%',
    },
})
