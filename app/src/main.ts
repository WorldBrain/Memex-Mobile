import {AppRegistry} from 'react-native'
import App from './App'
import { runDatabaseTest } from './db-test'

export function main() {
    AppRegistry.registerComponent('app', () => App)
    runDatabaseTest()
}
