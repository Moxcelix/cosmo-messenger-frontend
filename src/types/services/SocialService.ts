import { Profile } from "../models/Profile";

export interface SocialService{
    profileMe(jwt: string): Promise<Profile>
    profileUser(jwt: string, username: string): Promise<Profile>
}