import StorageManager from '@worldbrain/storex'
import type { StorageModules } from 'src/storage/types'
import type { Services } from 'src/services/types'

export function createSelfTests(options: {
    storageManager: StorageManager
    storageModules: StorageModules
    services: Services
    getServerStorageManager: () => Promise<StorageManager>
}) {
    const {
        storageModules: { personalCloud, localSettings: settings },
    } = options

    const ensureTestUser = async () => {
        const authService = options.services.auth
        let user = await authService.getCurrentUser()
        if (!user) {
            console.log('no user, making one')
            try {
                await authService.firebase
                    .auth()
                    .signInWithEmailAndPassword('test@test.com', 'testing')
                user = await authService.getCurrentUser()
            } catch (e) {
                await authService.firebase
                    .auth()
                    .createUserWithEmailAndPassword('test@test.com', 'testing')
            }
        }
        console.log('user:', user)
        if (!user) {
            throw new Error(`Could not authenticate user`)
        }
        return user
    }

    return {
        ensureTestUser,
        cloudSend: async () => {
            await clearDb(options.storageManager)
            console.log('Cleared local DB')

            const user = await ensureTestUser()
            console.log('Self test user:', user.id)

            const serverStorageManager = await options.getServerStorageManager()
            await clearDb(serverStorageManager, {
                getWhere: async (collectionName) => {
                    if (!collectionName.startsWith('personal')) {
                        return null
                    }
                    const objects = (await serverStorageManager
                        .collection(collectionName)
                        .findObjects({
                            user: user.id,
                        })) as any[]
                    if (!objects.length) {
                        return null
                    }
                    const where = {
                        user: user.id,
                        id: { $in: objects.map((object) => object.id) },
                    }
                    if (collectionName === 'personalDeviceInfo') {
                        console.log(collectionName, where)
                    }
                    return where
                },
            })
            console.log('Cleared Firestore personal cloud collections')

            await personalCloud['dependencies'].setDeviceId(null as any)
            await personalCloud.loadDeviceId()
            console.log('Generated device ID:', personalCloud.deviceId!)

            // if (process.env.TEST_READWISE_API_KEY?.length > 0) {
            //     await backgroundModules.settings.set({
            //         [EXTENSION_SETTINGS_NAME.ReadwiseAPIKey]:
            //             process.env.TEST_READWISE_API_KEY,
            //     })
            //     console.log('Set test Readwise API Key')
            // }

            const testPageUrl = 'https://www.getmemex.com/'
            // const normalizedTestPageUrl = normalizeUrl(testPageUrl, {})
            // await backgroundModules.tags.addTagToPage({
            //     url: testPageUrl,
            //     tag: 'test-tag',
            // })
            // console.log(`Added tag 'test-tag' to 'https://www.getmemex.com'`)
            // await backgroundModules.bookmarks.addBookmark({
            //     url: normalizedTestPageUrl,
            //     fullUrl: testPageUrl,
            //     skipIndexing: true,
            // })
            // console.log(`Bookmarked 'https://www.getmemex.com'`)
            // await backgroundModules.directLinking.createAnnotation(
            //     {
            //         tab: {} as any,
            //     },
            //     {
            //         pageUrl: normalizedTestPageUrl,
            //         comment: 'Hi, this is a test comment',
            //         createdWhen: new Date('2021-07-20'),
            //     },
            //     { skipPageIndexing: true },
            // )
            // console.log(`Added private note to 'https://www.getmemex.com'`)
            // await backgroundModules.directLinking.createAnnotation(
            //     {
            //         tab: {} as any,
            //     },
            //     {
            //         pageUrl: normalizedTestPageUrl,
            //         comment: `Yet another test comment! This one's protected`,
            //         privacyLevel: AnnotationPrivacyLevels.PROTECTED,
            //         createdWhen: new Date('2021-07-21'),
            //     },
            //     { skipPageIndexing: true },
            // )
            // console.log(`Added protected note to 'https://www.getmemex.com'`)
            // const testListId1 = await backgroundModules.customLists.createCustomList(
            //     {
            //         name: 'My test list #1',
            //     },
            // )
            // const testListId2 = await backgroundModules.customLists.createCustomList(
            //     {
            //         name: 'My test list #2',
            //     },
            // )
            // await backgroundModules.customLists.insertPageToList({
            //     id: testListId1,
            //     url: normalizedTestPageUrl,
            //     skipPageIndexing: true,
            // })
            // await backgroundModules.customLists.insertPageToList({
            //     id: testListId2,
            //     url: normalizedTestPageUrl,
            //     skipPageIndexing: true,
            // })
            // console.log(`Added 'https://www.getmemex.com' to 2 lists`)
            // await backgroundModules.copyPaster.createTemplate({
            //     title: 'Test template',
            //     code: 'Soem test code {{{PageTitle}}}',
            //     isFavourite: false,
            // })
            // console.log(`Added test copy-paster template`)

            // await personalCloud.waitForSync()
            // console.log('Waited for sync to cloud from this device')

            console.log('End of self test')
        },
        cloudReceive: async () => {
            await clearDb(options.storageManager)
            console.log('Cleared local DB')

            await ensureTestUser()
            console.log('setting id as null')
            await personalCloud['dependencies'].setDeviceId(null as any)
            console.log('set id as null')
            await settings.setSetting({
                key: 'syncLastProcessedTime',
                value: 0,
            })
            console.log('set last seen update time to 0')
            await options.storageModules.personalCloud.loadDeviceId()
            console.log('loaded device id')
        },
    }
}

async function clearDb(
    storageManager: StorageManager,
    options?: {
        getWhere?: (
            collectionName: string,
        ) => Promise<{ [key: string]: any } | null>
    },
) {
    const getWhere = options?.getWhere ?? (async () => ({}))

    await Promise.all(
        Object.keys(storageManager.registry.collections).map(
            async (collectionName) => {
                const where = await getWhere(collectionName)
                if (!where) {
                    return
                }

                try {
                    await storageManager.backend.operation(
                        'deleteObjects',
                        collectionName,
                        where,
                    )
                } catch (e) {
                    console.error(
                        `Failed to clear personal cloud collection: ${collectionName}`,
                    )
                    console.error(e)
                    throw new Error(
                        `Failed to clear personal cloud collection: ${collectionName}`,
                    )
                }
            },
        ),
    )
}
