import { Profile } from "../models/Profile";
import { ChangeBioRequest } from "../requests/ChangeBioRequest";
import { ChangeDisplayNameRequest } from "../requests/ChangeDisplayNameRequest";

export interface SocialService{
    profileMe(jwt: string): Promise<Profile>
    profileUser(jwt: string, username: string): Promise<Profile>
    changeDisplayName(jwt: string, request: ChangeDisplayNameRequest): Promise<void>
    changeBio(jwt: string, request: ChangeBioRequest): Promise<void>
}