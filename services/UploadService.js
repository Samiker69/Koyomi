class UploadService {
    /**
     * Загружает изображение/аттачмент на выбранный провайдер.
     * @param {object|string} evidence - Объект вложения Discord (с полем url) или прямая ссылка на изображение.
     * @param {string} provider - Название провайдера ('imgbb' или 'catbox').
     * @param {string|null} apiKey - Токен/ключ API для выбранного провайдера (если требуется).
     * @returns {Promise<string|null>} - Ссылка на загруженное изображение или null в случае неудачи.
     */
    static async upload(evidence, provider = 'catbox', apiKey = null) {
        const url = typeof evidence === 'string' ? evidence : evidence?.url;
        if (!url) return null;

        try {
            // Скачиваем изображение во временный буфер
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Не удалось скачать вложение: ${response.statusText}`);
            }
            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);

            switch (provider.toLowerCase()) {
                case 'imgbb':
                    if (!apiKey) {
                        console.warn('[UploadService] Для ImgBB требуется API-ключ. Пропуск загрузки.');
                        return url;
                    }
                    return await this._uploadToImgBB(buffer, apiKey);
                case 'catbox':
                    return await this._uploadToCatbox(buffer);
                default:
                    console.warn(`[UploadService] Неизвестный провайдер "${provider}". Возврат исходной ссылки.`);
                    return url;
            }
        } catch (error) {
            console.error(`[UploadService] Ошибка загрузки через провайдер ${provider}:`, error.message);
            return url; // Возвращаем исходную ссылку Discord в случае сбоя загрузки
        }
    }

    /**
     * Загрузка на ImgBB
     */
    static async _uploadToImgBB(buffer, apiKey) {
        const body = new FormData();
        body.append('image', buffer.toString('base64'));

        const response = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
            method: 'POST',
            body: body
        });

        if (!response.ok) {
            throw new Error(`ImgBB вернул статус ${response.status}`);
        }

        const data = await response.json();
        if (data && data.success) {
            return data.data.url;
        }
        throw new Error(data?.error?.message || 'Неизвестная ошибка ImgBB');
    }

    /**
     * Загрузка на Catbox (без ключа)
     */
    static async _uploadToCatbox(buffer) {
        const body = new FormData();
        body.append('reqtype', 'fileupload');
        const blob = new Blob([buffer], { type: 'image/png' });
        body.append('fileToUpload', blob, 'image.png');

        const response = await fetch('https://catbox.moe/user/api.php', {
            method: 'POST',
            body: body
        });

        if (!response.ok) {
            throw new Error(`Catbox вернул статус ${response.status}`);
        }

        const data = await response.text();
        if (data && data.startsWith('https://')) {
            return data.trim();
        }
        throw new Error(`Неизвестная ошибка Catbox: ${data}`);
    }
}

module.exports = UploadService;