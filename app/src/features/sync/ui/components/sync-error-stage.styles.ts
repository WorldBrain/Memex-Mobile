import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    errorTextContainer: {
        top: '11%',
        padding: 20,
    },
    helpContainer: {
        top: '14%',
        display: 'flex',
        flexDirection: 'column',
    },
    titleText: {
        top: '10%',
        fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 25,
    },
    bottomBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#ededed',
    },
    helpHeader: {
        textTransform: 'uppercase',
        fontSize: 13,
        marginLeft: 15,
        color: '#bdbdbf',
        lineHeight: 28,
    },
    helpEntry: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '90%',
        maxHeight: 50,
    },
    helpEntryText: {
        fontSize: 17,
        paddingHorizontal: 15,
        paddingVertical: 20,
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
        fontSize: 18,
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
