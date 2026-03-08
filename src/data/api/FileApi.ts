import { FileMeta } from "../../types/models/FileMeta";
import { FileService } from "../../types/services/FileService";
import { formatError } from "../../utils/formatError";

const BASE_URL = '/api/v2/file'

export class FileApi implements FileService {
    async uploadAvatar(jwt: string, file: File): Promise<FileMeta | undefined> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${BASE_URL}/avatar`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jwt}`,
            },
            body: formData,
        });

        if (!response.ok) {
            await formatError(response);

            return undefined
        }

        return await response.json();
        // Обновляем профиль с новой аватаркой
        // Например: updateProfile({ ...profile, avatar_url: data.avatar_url });
    }
}