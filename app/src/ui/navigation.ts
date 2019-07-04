import {
    createSwitchNavigator,
    createStackNavigator,
    createAppContainer,
} from 'react-navigation'

import Overview from 'src/features/overview/ui/screens/overview'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'
import PageEditor from 'src/features/page-editor/ui/screens/page-editor'

const OverviewNavigator = createStackNavigator(
    {
        Overview: { screen: Overview },
        PageEditor: { screen: PageEditor },
    },
    { headerMode: 'none' },
)

const MainNavigator = createSwitchNavigator(
    {
        Onboarding: { screen: Onboarding },
        Overview: OverviewNavigator,
        Sync: { screen: Sync },
    },
    {
        initialRouteName: 'Overview',
    },
)

const App = createAppContainer(MainNavigator)
export default App
