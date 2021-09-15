import { withEmulatedFirestoreBackend } from '@worldbrain/storex-backend-firestore/lib/index.tests'
import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    mainContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
    },
    checkList: {
        maxWidth: '80%',
        height: '55%',
        marginTop: '5%',
        paddingRight: 25,
    },
    comingSoonText: {
        color: '#091D62',
        fontSize: 14,
        textTransform: 'uppercase',
        fontWeight: 'bold',
        marginLeft: 43,
        marginBottom: 20,
    },
    mainImg: {
        height: '70%',
        width: '100%',
        position: 'absolute',
    },
})
