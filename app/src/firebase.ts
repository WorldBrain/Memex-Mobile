import { Platform } from 'react-native'
import _firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore'
import '@react-native-firebase/functions'
import '@react-native-firebase/auth'

export const getFirebase = () => _firebase

export async function connectToEmulator() {
    const firebase = getFirebase()
    console.log('DEBUG: attempting connect to Firebase emulator')

    const emulatorAddress = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
    const getEmulatorAddress = (args: { port: number; noProtocol?: boolean }) =>
        args.noProtocol
            ? `${emulatorAddress}:${args.port}`
            : `http://${emulatorAddress}:${args.port}`

    await firebase.firestore().settings({
        host: getEmulatorAddress({ port: 8080, noProtocol: true }),
        ssl: false,
        ignoreUndefinedProperties: true,
    })
    firebase.database().useEmulator(emulatorAddress, 9000)
    firebase.auth().useEmulator(getEmulatorAddress({ port: 9099 }))
    firebase
        .functions()
        .useFunctionsEmulator(getEmulatorAddress({ port: 5001 }))
}
