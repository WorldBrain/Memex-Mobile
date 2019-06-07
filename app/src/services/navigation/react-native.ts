import { NavigationService } from "./types";
import { NavigationContainerComponent, NavigationActions } from "react-navigation";

export interface ReactNativeNavigationServiceDependencies {
    navigationContainerComponent : NavigationContainerComponent
}

export default class ReactNativeNavigationService implements NavigationService {
    private dependencies? : ReactNativeNavigationServiceDependencies
    
    setDependencies(dependencies : ReactNativeNavigationServiceDependencies) {
        this.dependencies = dependencies
    }
    
    goTo(routeName : string) {
        if (!this.dependencies) {
            throw new Error(`Tried to call NavigationService.goTo() before injecting service dependencies`)
        }
        
        this.dependencies.navigationContainerComponent.dispatch(
            NavigationActions.navigate({
                routeName,
                params: {},
            })
        )
    }
}
    