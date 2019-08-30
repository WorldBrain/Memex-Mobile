import { createStorage } from 'src/storage'
import { Storage } from 'src/storage/types'

export function makeStorageTestFactory() {
    type TestFunction = (context: TestContext) => Promise<void>
    interface TestContext {
        storage: Storage
    }
    /*
     * Multiple tests throw errors running on the same connection. So give each test a different
     *  connection name.
     * Manually calling `this.connection.close()` in the TypeORM backend after the test is run
     *  does not seem to help.
     */
    let connIterator = 0

    function factory(description: string, test?: TestFunction): void {
        if (!test) {
            it.todo(description)
            return
        }

        it(description, async function() {
            const storage = await createStorage({
                typeORMConnectionOpts: {
                    type: 'sqlite',
                    database: ':memory:',
                    name: `connection-${connIterator++}`,
                },
            })

            try {
                await test.call(this, { storage })
            } finally {
            }
        })
    }

    return factory
}
