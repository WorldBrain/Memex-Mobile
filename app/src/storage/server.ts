import StorageManager from '@worldbrain/storex'
import { FirestoreStorageBackend } from '@worldbrain/storex-backend-firestore'
import type { ReactNativeFirebase } from '@react-native-firebase/app'

export function createServerStorageManager(
    firebase: ReactNativeFirebase.Module,
) {
    const serverStorageBackend = new FirestoreStorageBackend({
        firebase: firebase as any,
        firestore: firebase.firestore() as any,
    })
    return new StorageManager({ backend: serverStorageBackend })
}
