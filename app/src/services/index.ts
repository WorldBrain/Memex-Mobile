import { Services } from "./types";
import { WorldBrainAuthService } from "./auth/wb-auth";
import ReactNativeNavigationService from "./navigation/react-native";

export interface CreateServicesOptions {
}

export async function createServices(options : CreateServicesOptions) : Promise<Services> {
    return {
        auth: new WorldBrainAuthService(),
        navigation: new ReactNativeNavigationService()
    }
}
