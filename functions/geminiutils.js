/**
 * Фильтрует модели, способные генерировать текст, и возвращает Map
 * с их displayName и outputTokenLimit.
 *
 * @param {Array<Object>} allModels Массив всех доступных моделей (как получено из ai.models.list()).
 * @returns {Map<string, Object<string | Number>>} Map, где ключ - айди модели, значение - {displayName, outputTokenLimit}.
 */
function getTextModelOutputLimitsMap(allModels) {
    const textOutputModelsMap = new Map();
  
    allModels.forEach(model => {
      if (model.supportedActions.includes('generateContent') && !model.name.includes('preview')) {
        textOutputModelsMap.set(model.name, { name: model.name, displayName: model.displayName, outputTokenLimit: model.outputTokenLimit });
      }
    });
  
    return textOutputModelsMap;
}

module.exports = getTextModelOutputLimitsMap