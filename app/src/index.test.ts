import { createStorage } from 'src/storage'
import { Storage } from 'src/storage/types'

export function makeTestFactory() {
    type TestContext = Storage
    type TestFunction = (context: TestContext) => Promise<void>

    function factory(description: string, test?: TestFunction): void {
        it(
            description,
            test &&
                async function() {
                    const storage = await createStorage({
                        typeORMConnectionOpts: {
                            type: 'sqlite',
                            database: 'test',
                        },
                    })

                    const testContext = this
                    try {
                        await test.call(testContext, storage)
                    } finally {
                    }
                },
        )
    }

    return factory
}

it.todo('')
