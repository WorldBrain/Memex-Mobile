import StorageManager from '@worldbrain/storex'
import { FirestoreStorageBackend } from '@worldbrain/storex-backend-firestore'
import type { ReactNativeFirebase } from '@react-native-firebase/app'
import { DexieStorageBackend } from '@worldbrain/storex-backend-dexie'
import inMemory from '@worldbrain/storex-backend-dexie/lib/in-memory'

export function createServerStorageManager(
    firebase: ReactNativeFirebase.Module,
    firebaseModule?: ReactNativeFirebase.Module,
) {
    const backend = new FirestoreStorageBackend({
        firebase: firebase as any,
        firebaseModule: firebaseModule as any,
        firestore: firebase.firestore() as any,
    })
    return new StorageManager({ backend })
}

export function createMemoryServerStorageManager() {
    const backend = new DexieStorageBackend({
        dbName: 'server',
        idbImplementation: inMemory(),
        legacyMemexCompatibility: true,
    })
    return new StorageManager({ backend })
}
