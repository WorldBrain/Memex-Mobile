import { Services } from "./types";
import { WorldBrainAuthService } from "./auth/wb-auth";

export interface CreateServicesOptions {
}

export async function createServices(options : CreateServicesOptions) : Promise<Services> {
    return {
        auth: new WorldBrainAuthService()
    }
}
