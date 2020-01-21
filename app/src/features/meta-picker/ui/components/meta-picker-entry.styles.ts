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
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 5,
    },
    entryBackground: {
        backgroundColor: '#83c9f4',
    },
    entryText: {
        fontSize: 18,
        color: '#545454',
        fontWeight: '400',
    },
    emptyRowText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 18,
    },
    addText: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    checkmark: {
        width: 25,
        height: 25,
    },
    checkmarkHidden: {
        display: 'none',
    },
})
