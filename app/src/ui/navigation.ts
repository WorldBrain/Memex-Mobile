import { createSwitchNavigator, createAppContainer } from 'react-navigation'

import Overview from 'src/features/overview/ui/screens/overview'
import Onboarding from 'src/features/onboarding/ui/screens/onboarding'

const MainNavigator = createSwitchNavigator(
    {
        Onboarding: { screen: Onboarding },
        Overview: { screen: Overview },
    },
    {
        initialRouteName: 'Onboarding',
    },
)

const App = createAppContainer(MainNavigator)
export default App
