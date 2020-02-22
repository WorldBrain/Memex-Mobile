import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        padding: '1.2rem',
        width: '100%',
    },
    noteText: {
        marginBottom: 5,
        fontSize: 14,
        overflow: 'hidden',
        color: '#3A2F45',
        lineHeight: 20,
    },
    text: {
        backgroundColor: '#93fed7',
        paddingHorizontal: 10,
    },
    commentText: {
        marginBottom: 10,
        color: '#3A2F45',
        fontSize: 14,
    },
    dateContainer: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
    },
    date: {
        fontSize: 12,
        color: '#3A2F45',
    },
    lastEdited: {
        fontSize: 10,
        color: 'black',
        marginRight: 5,
    },
})
