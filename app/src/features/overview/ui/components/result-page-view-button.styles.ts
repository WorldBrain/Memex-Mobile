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
        height: '100%',
    },
    tagContainer: {
        marginTop: '0.6rem',
    },
})
