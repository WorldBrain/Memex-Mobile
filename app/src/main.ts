import { createStorage } from './storage'
import { createServices } from './services'
import { UI } from './ui'

export async function main() {
    const ui = new UI()
    const storage = await createStorage({
        typeORMConnectionOpts: {
            type: 'react-native',
            location: 'Shared',
            database: 'memex',
        },
    })
    const services = await createServices({})
    ui.initialize({ dependencies: { storage, services } })
}
