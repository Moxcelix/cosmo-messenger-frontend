import { Profile } from "../../types/models/Profile";
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
}