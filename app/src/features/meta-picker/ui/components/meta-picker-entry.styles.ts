import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 15,
    },
    containerBorder: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    entry: {
        backgroundColor: '#83c9f4',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    entryText: {
        fontSize: 18,
    },
    checkmark: {
        width: 20,
        height: 20,
        backgroundColor: '#c4c4c4',
    },
    checkmarkHidden: {
        display: 'none',
    },
})
