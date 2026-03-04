import { Profile } from "../../types/models/Profile";
import { ChangeBioRequest } from "../../types/requests/ChangeBioRequest";
import { ChangeDisplayNameRequest } from "../../types/requests/ChangeDisplayNameRequest";
import { SocialService } from "../../types/services/SocialService";
import { formatError } from "../../utils/formatError";

const BASE_URL = '/api/v2/social'

export class SocialApi implements SocialService {
    async profileMe(jwt: string): Promise<Profile> {
        const response = await fetch(`${BASE_URL}/profile/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return await response.json();
    }

    async profileUser(jwt: string, username: string): Promise<Profile> {
        const response = await fetch(`${BASE_URL}/profile?username=${username}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            await formatError(response);
        }

        return await response.json();
    }

    async changeDisplayName(jwt: string, request: ChangeDisplayNameRequest): Promise<void>{
        const response = await fetch(`${BASE_URL}/profile/displayname`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }
    }

    async changeBio(jwt: string, request: ChangeBioRequest): Promise<void>{
        const response = await fetch(`${BASE_URL}/profile/bio`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            await formatError(response);
        }
    }
}