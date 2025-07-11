function geminiCrashHadler(error) {
    if (!error) {
        return false;
    }

    let errorMessageText = '';
    let status; // HTTP-like status or Google-specific error code/status

    // Extract message and status from various possible error structures
    if (typeof error === 'string') {
        errorMessageText = error.toLowerCase();
    } else {
        if (error.message) {
            errorMessageText = String(error.message).toLowerCase();
        }

        // GoogleGenerativeAIError often has a 'status' property (e.g., 429, 400)
        // It can also be a string like 'INVALID_ARGUMENT'
        if (error.status) {
            status = error.status;
        }

        // Sometimes the detailed error is nested under error.response.error
        // e.g. from ClientError: got status: 400 Bad Request. {"error":{"code":400,"message":"...", "status":"INVALID_ARGUMENT"}}
        if (error.response && error.response.error) {
            const nestedError = error.response.error;
            if (nestedError.message && !errorMessageText.includes(String(nestedError.message).toLowerCase())) {
                errorMessageText += ' ' + String(nestedError.message).toLowerCase(); // Append if not already part of the main message
            }
            if (nestedError.code) { // numeric code, e.g., 400
                status = nestedError.code;
            } else if (nestedError.status && !status) { // string status, e.g., "INVALID_ARGUMENT"
                status = nestedError.status;
            }
        }

        // Safety/Content blocking errors might be in error.response.promptFeedback
        if (error.response && error.response.promptFeedback && error.response.promptFeedback.blockReason) {
            const reason = error.response.promptFeedback.blockReason;
            return `Контент заблокирован по соображениям безопасности. Причина: ${reason}.`;
        }
        // Or if candidates array is empty and finishReason is SAFETY
        if (error.response && error.response.candidates && Array.isArray(error.response.candidates)) {
            if (error.response.candidates.length === 0 && errorMessageText.includes('finish_reason: safety')) {
                 return `Контент заблокирован по соображениям безопасности (ответ не содержит кандидатов).`;
            }
            const safetyCandidate = error.response.candidates.find(c => c.finishReason === 'SAFETY');
            if (safetyCandidate) {
                return `Генерация остановлена по соображениям безопасности (SAFETY).`;
            }
        }
    }

    // Normalize status if it's a string representing a number
    if (typeof status === 'string' && !isNaN(parseInt(status, 10))) {
        status = parseInt(status, 10);
    }


    // 1. Handle 429: Quota Exceeded / Too Many Requests
    if (status === 429 || errorMessageText.includes('429') || errorMessageText.includes('quota') || errorMessageText.includes('resource has been exhausted')) {
        return "Превышена квота запросов (Ошибка 429). Пожалуйста, попробуйте позже или проверьте лимиты вашего API ключа.";
    }

    // 2. Handle 400: Bad Request (various reasons)
    if (status === 400 || status === 'INVALID_ARGUMENT' || errorMessageText.includes('400 bad request') || errorMessageText.includes('invalid_argument')) {
        if (errorMessageText.includes('api key not valid') || (errorMessageText.includes('permission_denied') && errorMessageText.includes('api key'))) {
            return "API ключ недействителен, не указан или не имеет необходимых разрешений (Ошибка 400). Проверьте ваш API ключ.";
        }
        if (errorMessageText.includes('model') && (errorMessageText.includes('not found') || errorMessageText.includes('unexpected model name format') || errorMessageText.includes('unsupported'))) {
            return "Указана неверная или неподдерживаемая модель (Ошибка 400). Проверьте имя модели.";
        }
        if (errorMessageText.includes('user location is not supported')) {
            return "Ваше местоположение не поддерживается для использования этого API (Ошибка 400).";
        }
        if (errorMessageText.includes('invalid json payload')) {
            return "Ошибка в формате JSON запроса (Ошибка 400). Проверьте структуру отправляемых данных.";
        }
        // Generic 400 / INVALID_ARGUMENT
        let details = error.message || (error.response && error.response.error && error.response.error.message) || '';
        if (details.startsWith('[VertexAI.GoogleGenerativeAIError]: ')) { // Clean up common prefix
            details = details.substring('[VertexAI.GoogleGenerativeAIError]: '.length);
        }
        if (details.startsWith('got status: 400 Bad Request.')) {
             details = details.substring('got status: 400 Bad Request.'.length).trim();
        }

        return `Ошибка в запросе (400 Bad Request / INVALID_ARGUMENT). Проверьте параметры. ${details ? 'Детали: ' + details : ''}`;
    }

    // 3. Handle 401: Unauthorized (Authentication issues)
    if (status === 401 || errorMessageText.includes('401') || errorMessageText.includes('unauthenticated')) {
        return "Ошибка аутентификации (401 Unauthorized). Проверьте ваш API ключ.";
    }

    // 4. Handle 403: Forbidden (Permission issues)
    if (status === 403 || status === 'PERMISSION_DENIED' || errorMessageText.includes('403') || (errorMessageText.includes('permission_denied') && !errorMessageText.includes('api key'))) { // "api key" related permission issue is often a 400
        return "Ошибка авторизации (403 Forbidden / PERMISSION_DENIED). У вашего API ключа нет разрешений на это действие, или доступ к ресурсу запрещен.";
    }

    if (status === 404 || status === 'NOT_FOUND' || errorMessageText.includes('404') || errorMessageText.includes('Model is not found')) {
        return "Используемая модель не найдена. Проверьте правильность написания кодового названия модели."
    }
    
    // 5. Handle 500: Internal Server Error
    if (status === 500 || status === 'INTERNAL' || errorMessageText.includes('500') || errorMessageText.includes('internal error')) {
        return "Внутренняя ошибка сервера Google (500 Internal Server Error). Пожалуйста, попробуйте позже.";
    }

    // 6. Handle 503: Service Unavailable
    if (status === 503 || status === 'UNAVAILABLE' || errorMessageText.includes('503') || errorMessageText.includes('service unavailable')) {
        return "Сервис временно недоступен (503 Service Unavailable). Пожалуйста, попробуйте позже.";
    }

    // Fallback for other GoogleGenerativeAIError instances not caught by specific status/message
    if (error.name === 'GoogleGenerativeAIError' || 
        (typeof error === 'object' && error !== null && Object.getPrototypeOf(error)?.constructor?.name?.includes('Google'))) {
        let originalMessage = error.message || errorMessageText || 'Неизвестная ошибка Google GenAI.';
        return `Произошла ошибка при работе с Google GenAI: ${originalMessage}`;
    }
    
    // If the error message generally points to genai or google but wasn't caught
    if (errorMessageText.includes('genai') || errorMessageText.includes('google') || errorMessageText.includes('gemini')) {
        return `Обнаружена ошибка, связанная с Google GenAI: ${error.message || errorMessageText || 'Детали неизвестны.'}`;
    }

    return false; // No specific Google GenAI error pattern found
}

module.exports = geminiCrashHadler;