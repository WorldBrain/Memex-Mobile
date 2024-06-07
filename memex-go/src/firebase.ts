import { Platform } from 'react-native'
import _firebase from '@react-native-firebase/app'
import '@react-native-firebase/firestore'
import '@react-native-firebase/functions'
import '@react-native-firebase/auth'
import '@react-native-firebase/database'
import '@react-native-firebase/storage'
import type { AuthFirebaseDeps } from '@worldbrain/memex-common/lib/authentication/worldbrain'
import type { CloudBackendFirebaseDeps } from '@worldbrain/memex-common/lib/personal-cloud/backend/firebase'

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

export const reactNativeFBToAuthFBDeps = (
    firebase: typeof _firebase,
): AuthFirebaseDeps => {
    const auth = firebase.auth()
    const functions = firebase.functions()
    return {
        getAuth: () => auth as any,
        getFunctions: () => functions as any,
        httpsCallable: (_, name) => functions.httpsCallable(name) as any,
        signInWithCustomToken: (_, token) =>
            auth.signInWithCustomToken(token) as any,
        sendPasswordResetEmail: (_, email) =>
            auth.sendPasswordResetEmail(email) as any,
        signInWithEmailAndPassword: (_, email, pw) =>
            auth.signInWithEmailAndPassword(email, pw) as any,
        createUserWithEmailAndPassword: (_, email, pw) =>
            auth.createUserWithEmailAndPassword(email, pw) as any,
        signInViaProvider: (_) => {
            throw new Error(
                'Provider sign-in method not yet supported on mobile',
            )
        },
    }
}
export const reactNativeFBToCloudBackendFBDeps = (
    firebase: typeof _firebase,
): CloudBackendFirebaseDeps => {
    const auth = firebase.auth()
    const storage = firebase.storage()
    return {
        getAuth: () => auth as any,
        getStorage: () => storage as any,
        ref: (_, path) => storage.ref(path) as any,
        uploadBytes: (ref, obj) => (ref as any).put(obj),
        uploadString: (ref, str, format, meta) =>
            (ref as any).putString(str, format, meta),
        getDownloadURL: (ref) => (ref as any).getDownloadURL(),
    }
}
