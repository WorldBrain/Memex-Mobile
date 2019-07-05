import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    noteListContainer: {
        flex: 8,
    },
    headContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
        marginHorizontal: 15,
        maxHeight: 35,
    },
    countIcon: {
        flex: 1,
        width: 25,
        height: 25,
        backgroundColor: '#c4c4c4',
    },
    addIcon: {
        flex: 1,
    },
    mainText: {
        flex: 8,
        fontSize: 18,
        textAlign: 'left',
        marginLeft: 10,
    },
})
