import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 10,
        paddingVertical: 50,
        paddingHorizontal: 20,
    },
    infoContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    infoTitle: {
        fontWeight: 'bold',
    },
    textInput: {
        margin: 10,
        padding: 10,
        height: '3rem',
        minWidth: '90%',
        backgroundColor: '#d3d3d3',
    },
    actionBtnsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    extraContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
})
