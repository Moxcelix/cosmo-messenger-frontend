import { FileMeta } from "../models/FileMeta";

export interface FileService {
    uploadAvatar(jwt: string, file: File): Promise<FileMeta | undefined>
}