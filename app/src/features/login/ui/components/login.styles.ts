import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        paddingTop: 50,
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
})
