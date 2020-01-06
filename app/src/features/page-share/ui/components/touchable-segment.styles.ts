import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
    },
    outter: {
        flex: 1,
    },
    mainText: {
        color: '#545454',
        fontWeight: '400',
        fontSize: 16,
    },
    border: {
        borderBottomWidth: 1,
        borderBottomColor: '#eaeae9',
    },
    starIcon: {
        width: 25,
        height: 25,
    },
})
