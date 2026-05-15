const { readdirSync, statSync } = require('fs');
const { join } = require('path');

class FileLoader {
    static getAllFiles(dirPath, arrayOfFiles = []) {
        const files = readdirSync(dirPath);

        files.forEach((file) => {
            const fullPath = join(dirPath, file);
            if (statSync(fullPath).isDirectory()) {
                arrayOfFiles = FileLoader.getAllFiles(fullPath, arrayOfFiles);
            } else {
                if (file.endsWith('.js')) {
                    arrayOfFiles.push(fullPath);
                }
            }
        });

        return arrayOfFiles;
    }
}

module.exports = FileLoader;