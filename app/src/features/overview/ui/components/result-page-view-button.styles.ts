import EStyleSheet from 'react-native-extended-stylesheet'
import { start } from 'repl'

export default EStyleSheet.create({
    favIcon: {},
    container: {
        backgroundColor: '#667BCC',
        width: '100%',
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingLeft: '1.3rem',
        paddingRight: '1rem',
        paddingVertical: '0.5rem',
        flexDirection: 'row',
    },
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
    text: {
        color: 'white',
        width: '90%',
    },
})
