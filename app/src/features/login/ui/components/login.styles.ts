import EStyleSheet from 'react-native-extended-stylesheet'

export default EStyleSheet.create({
    container: {
        // display: 'flex',
        flex: 1,
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
        fontSize: '1.5rem',
        marginTop: 30,
    },
    infoSubtext: {
        fontSize: '1.2rem',
        marginTop: 10,
        marginBottom: 10,
    },
    textInput: {
        margin: 10,
        padding: 10,
        height: '3rem',
        minWidth: '90%',
        backgroundColor: '#d3d3d3',
        borderRadius: 5,
        color: '#545454',
    },
    actionBtnsContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 25,
    },
    extraContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    loginButton: {
        width: 150,
        borderRadius: 3,
    },
    cancelButton: {
        height: 30,
        marginTop: 15,
    },
    modeButton: {
        height: 30,
        marginTop: 15,
    },
    forgotPasswordButton: {
        height: 30,
        marginTop: 15,
    },
    errorTitle: {
        fontSize: '1.1rem',
        paddingHorizontal: 30,
        textAlign: 'center',
    },

    // Ipad Styles
    ipadContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    ipadInfoContainer: {
        display: 'flex',
        // flex:0.13,
        flexDirection: 'column',
        alignItems: 'center',
        marginBottom: 10,
    },
    ipadInfoTitle: {
        fontWeight: 'bold',
        fontSize: '1rem',
        marginTop: 40,
    },
    ipadInfoSubtext: {
        fontSize: '1.2rem',
        marginTop: 10,
        marginBottom: 10,
    },
    ipadTextInput: {
        margin: 10,
        padding: 10,
        height: '1.7rem',
        minWidth: '50%',
        backgroundColor: '#d3d3d3',
        borderRadius: 5,
    },
    ipadActionBtnsContainer: {
        display: 'flex',
        flex: 0.4,
        flexDirection: 'column',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginVertical: 25,
    },
    ipadExtraContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    ipadLoginButton: {
        // width: 150,
        borderRadius: 60,
    },
    ipadCancelButton: {
        height: 30,
        marginTop: 15,
    },
    ipadModeButton: {
        height: 30,
        marginTop: 15,
        marginVertical: 20,
    },
    ipadForgotPasswordButton: {
        // height: 30,
        // marginTop: 15,
    },
    ipadErrorTitle: {
        fontSize: '1.1rem',
        paddingHorizontal: 30,
        textAlign: 'center',
    },
})
