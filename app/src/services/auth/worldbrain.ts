import { EventEmitter } from 'events'
import TypedEventEmitter from 'typed-emitter'
import firebase from '@react-native-firebase/app'
import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import '@react-native-firebase/functions'
import { AuthService, AuthenticatedUser, AuthServiceEvents } from './types'

export class WorldbrainAuthService implements AuthService {
    public events = new EventEmitter() as TypedEventEmitter<AuthServiceEvents>

    constructor() {
        firebase.auth().onAuthStateChanged(firebaseUser => {
            const user = this._getUserFromFirebaseUser(firebaseUser)
            this.events.emit('changed', { user })
        })
    }

    async getCurrentUser() {
        return this._getUserFromFirebaseUser(firebase.auth().currentUser)
    }

    async refreshUserInfo() {
        const firebaseUser = firebase.auth().currentUser
        if (!firebaseUser) {
            return
        }

        await this._callFirebaseFunction('refreshUserClaims')()
        await firebaseUser.reload()
        this.events.emit('changed', { user: await this.getCurrentUser() })
    }

    async generateLoginToken() {
        return (await this._callFirebaseFunction('getCustomLoginToken')()).data
    }

    async loginWithToken(token: string) {
        await firebase.auth().signInWithCustomToken(token)
    }

    _getUserFromFirebaseUser(
        user?: FirebaseAuthTypes.User | null,
    ): AuthenticatedUser | null {
        if (!user) {
            return null
        }
        return {
            id: user.uid,
            displayName: user.displayName,
            email: user.email,
            emailVerified: user.emailVerified,
        }
    }

    _callFirebaseFunction(name: string, ...args: any[]) {
        return firebase.functions().httpsCallable(name)(...args)
    }
}
