import { StyleSheet } from 'react-native'

export default StyleSheet.create({
    boldText: {
        fontWeight: 'bold',
    },
    instructionText: {
        position: 'relative',
        top: 60,
        fontSize: 20,
        lineHeight: 30,
        textAlign: 'center',
        marginLeft: '5%',
        marginRight: '5%',
    },
    mainImgContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '100%',
        top: 30,
    },
    mainImg: {
        width: '90%',
        height: '80%',
        marginRight: 100,
        marginLeft: 100,
        marginTop: 30,
        display: 'flex',
        justifyContent: 'center',
    },
})
