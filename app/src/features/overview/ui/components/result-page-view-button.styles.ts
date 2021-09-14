import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    favIcon: {},
    touchContainer: {
        flexDirection: 'column',
    },
    contentContainer: {
        flexDirection: 'column',
        paddingTop: '1.6rem',
        flex: 1,
        paddingBottom: '1.3rem',
        paddingLeft: '1.3rem',
    },
    resultContainer: {
        flexDirection: 'row',
        maxWidth: '100%',
        justifyContent: 'space-between',
    },
    actionContainer: {
        height: '2rem',
        display: 'flex',
        marginTop: '1.5rem',
    },
    tagContainer: {
        marginTop: '0.6rem',
    },
    ActionButtonContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    },
    VisitButton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        color: 'white',
        height: '100%',
        justifyContent: 'center',
    },
})
