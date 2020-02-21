import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    backIcon: {
        width: 15,
        height: 20,
        marginRight: 20,
        marginLeft: 5,
    },
    saveIcon: {
        width: 20,
        height: 30,
    },
    container: {
        top: 50,
        flex: 1,
        flexDirection: 'column',
    },
    highlightTextContainer: {},
    highlightText: {
        backgroundColor: '#93fed7',
        paddingHorizontal: 10,
        lineHeight: 20,
    },
    noteInputContainer: {
        flex: 1,
        maxHeight: 200,
        borderBottomWidth: 0,
        marginTop: 20,
    },
    noteInput: {
        padding: 20,
        backgroundColor: '#F1F1F1',
        borderRadius: 4,
    },
})
