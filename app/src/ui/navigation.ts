import { createSwitchNavigator, createAppContainer } from 'react-navigation'

import Overview from 'src/features/overview/ui/screens/overview'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'
import Sync from 'src/features/sync/ui/screens/sync'

const MainNavigator = createSwitchNavigator(
    {
        Onboarding: { screen: Onboarding },
        Overview: { screen: Overview },
        Sync: { screen: Sync },
    },
    {
        initialRouteName: 'Onboarding',
    },
)

const App = createAppContainer(MainNavigator)
export default App
