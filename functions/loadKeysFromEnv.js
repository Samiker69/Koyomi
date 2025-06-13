/**
 * Загружает ключи из .env
 * @returns { [...String] | { error: String } } вернёт массив ключей либо объект с ошибкой об отсутствии ключей
 */
function loadApiKeys() {
    const keys = [];
    
    // Загружаем ключи из переменных окружения
    let i = 1;
    while (true) {
        const key = process.env[`gemini_api_key_${i}`] || process.env[`gemini_api_key${i}`];
        if (!key) {
            if (i === 1) {
                // Проверяем основной ключ
                const mainKey = process.env.gemini_api_key;
                if (mainKey) {
                    keys.push(mainKey);
                }
            }
            break;
        }
        keys.push(key);
        i++;
    }

    if (keys.length === 0) {
        return { error: 'Не найдено ни одного ключа в `.env`!' }
    }
    
    return keys;
}

module.exports = loadApiKeys