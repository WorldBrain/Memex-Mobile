import { createStackNavigator } from "react-navigation";
import HomeScreen from "src/features/example/ui/screens/home-screen";
import OtherScreen from "src/features/example/ui/screens/other-screen";

export default createStackNavigator(
    {
        Home: {
            screen: HomeScreen
        },
        Other: {
            screen: OtherScreen
        }
    },
    {
        initialRouteName: "Home"
    }
)
