let m = [];
document.addEventListener('DOMContentLoaded', populateGeminiModels);

document.getElementById('user-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());

    // Преобразуем пустые строки в null для опциональных полей
    if (data.top_p === '') data.top_p = null;
    if (data.top_k === '') data.top_k = null;
    
    try {
        const response = await fetch('/api/gemini/user-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Основные настройки сохранены!');
        } else {
            alert('Ошибка сохранения настроек');
        }
    } catch (error) {
        alert('Ошибка сохранения настроек');
    }
});

document.getElementById('safety-settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    try {
        const response = await fetch('/api/gemini/safety-settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            alert('Настройки безопасности сохранены!');
        } else {
            alert('Ошибка сохранения настроек');
        }
    } catch (error) {
        alert('Ошибка сохранения настроек');
    }
});

async function populateGeminiModels() {
    const modelSelect = document.getElementById('model');

    if (!modelSelect) {
        console.warn('Элемент <select id="model"> не найден.');
        return;
    }

    try {
        const response = await fetch('/api/gemini/models');
        if (!response.ok) {
            throw new Error(`Ошибка HTTP: ${response.status}`);
        }
        const models = await response.json(); // Получаем объект с моделями
        m = models

        // Очищаем существующие опции
        modelSelect.innerHTML = '';

        // Добавляем опции из полученных данных
        for (const modelId in models) {
            // Используем hasOwnProperty для безопасной итерации
            if (Object.prototype.hasOwnProperty.call(models, modelId)) {
                const model = models[modelId];
                const option = document.createElement('option');
                // Ваши HTML-опции используют displayName в качестве value и текста.
                option.value = model.name;
                option.textContent = model.displayName;
                modelSelect.appendChild(option);
            }
        }

        // После того как все опции добавлены, пытаемся выбрать предпочитаемую модель
        if (preferredModel) {
            modelSelect.value = preferredModel;
        } else if (modelSelect.options.length > 0) {
            // Если нет предпочитаемой модели, но есть опции, выбираем первую
            modelSelect.value = modelSelect.options[0].value;
        }

    } catch (error) {
        console.error('Ошибка загрузки моделей Gemini:', error);
        // В случае ошибки, выводим сообщение в выпадающем списке
        modelSelect.innerHTML = '<option value="" disabled selected>Ошибка загрузки моделей</option>';
    }
}