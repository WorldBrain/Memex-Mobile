import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        marginTop: 30,
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    pageList: {
        width: '100%',
        marginBottom: 0,
    },
    mainLoadSpinner: {
        marginTop: 155,
    },
    loadMoreSpinner: {
        position: 'absolute',
        bottom: 60,
    },
})
