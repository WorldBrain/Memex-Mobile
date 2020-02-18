import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
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
        width: 20,
        height: 20,
        opacity: 0.3,
    },
    addIcon: {
        width: 20,
        height: 20,
        opacity: 0.3,
    },
    mainText: {
        flex: 8,
        fontSize: 18,
        textAlign: 'left',
        marginLeft: 10,
    },
})
