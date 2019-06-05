import {AppRegistry} from 'react-native'
import {name as appName} from '../../app.json'
import HomeScreen from 'src/features/example/ui/screens/home-screen'

export function runUI() {
    AppRegistry.registerComponent(appName, () => HomeScreen)
}
