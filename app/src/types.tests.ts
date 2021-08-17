import type { StorageOperationEvent } from '@worldbrain/storex-middleware-change-watcher/lib/types'
import type { MemoryAuthService } from '@worldbrain/memex-common/lib/authentication/memory'
import type { RouteProp } from '@react-navigation/native'

import type { FakeNavigation } from './tests/navigation'
import type { Storage } from 'src/storage/types'
import type { Services } from './services/types'
import { PersonalDeviceInfo } from '@worldbrain/memex-common/lib/web-interface/types/storex-generated/personal-cloud'

export interface TestDevice {
    storage: Storage
    services: Services
    auth: MemoryAuthService
    navigation: FakeNavigation
    route: RouteProp<any, any>
}

export type MultiDeviceTestFunction = (
    context: MultiDeviceTestContext,
) => Promise<void>

export interface MultiDeviceTestContext {
    createDevice: TestDeviceFactory
}

export type TestDeviceFactory = (options: {
    debugSql?: boolean
    backend?: 'dexie' | 'typeorm'
    deviceInfo: Pick<PersonalDeviceInfo, 'type' | 'os' | 'product' | 'browser'>
    extraPostChangeWatcher?: (
        context: StorageOperationEvent<'post'>,
    ) => void | Promise<void>
}) => Promise<TestDevice>

export interface SingleDeviceTestOptions {
    skipSyncTests?: boolean
    debugSql?: boolean
    mark?: boolean
}

export type SingleDeviceTestFunction = (device: TestDevice) => Promise<void>

export type SingleDeviceTestFactory = ((
    description: string,
    test?: SingleDeviceTestFunction,
) => void) &
    ((
        description: string,
        options: SingleDeviceTestOptions,
        test: SingleDeviceTestFunction,
    ) => void)

export type StorageContents = { [collection: string]: any[] }
