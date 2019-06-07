import { NavigationService } from "./types";
import { NavigationContainerComponent, NavigationActions } from "react-navigation";

export default class ReactNativeNavigationService implements NavigationService {
    private navigationContainerComponent? : NavigationContainerComponent
    
    setNavigationContainerComponent(navigationContainerComponent : NavigationContainerComponent) {
        this.navigationContainerComponent = navigationContainerComponent
    }
    
    goTo(routeName : string) {
        if (!this.navigationContainerComponent) {
            throw new Error(`Tried to call NavigationService.goTo() before setting initializing React Navigation`)
        }
        
        this.navigationContainerComponent.dispatch(
            NavigationActions.navigate({
                routeName,
                params: {},
            })
        )
    }
}
    