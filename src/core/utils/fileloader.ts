import { readdirSync, statSync } from 'fs';
import { join } from 'path';

export function getAllFiles(dirPath: string, arrayOfFiles: string[] = []): string[] {
    const files = readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = join(dirPath, file);
        if (statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.js')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}