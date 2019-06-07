import React from 'react'
import { createStackNavigator } from "react-navigation";
import { Storage } from "src/storage/types";
import { Services } from "src/services/types";
import HomeScreen from "src/features/example/ui/screens/home-screen";
import OtherScreen from "src/features/example/ui/screens/other-screen";

type ScreenDependencies = { storage : Storage, services : Services }

function createScreen(screenClass : any, dependencies : ScreenDependencies) {
    return () => React.createElement(screenClass, dependencies)
}  

export default (dependencies : ScreenDependencies) => createStackNavigator(
    {
        Home: {
            screen: createScreen(HomeScreen, dependencies)
        },
        Other: {
            screen: createScreen(OtherScreen, dependencies)
        }
    },
    {
        initialRouteName: "Home"
    }
)
