import { Profile } from "../models/Profile";

export interface ProfileService{
    profileMe(jwt: string): Promise<Profile>
    profileUser(jwt: string, username: string): Promise<Profile>
}