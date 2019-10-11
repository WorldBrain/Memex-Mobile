import firestore from '@react-native-firebase/firestore'
import StorageManager from '@worldbrain/storex'
import { FirestoreStorageBackend } from '@worldbrain/storex-backend-firestore'

export function createServerStorageManager() {
    const serverStorageBackend = new FirestoreStorageBackend({
        firebase: { firestore } as any,
        firestore: firestore() as any,
    })
    return new StorageManager({ backend: serverStorageBackend })
}
