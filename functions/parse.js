// получает только самое начало
function extractLogInfo(logContent) {
    const results = {
        'Launcher version': null,
        'Architecture': null,
        'Device model': null,
        'API version': null,
        'Selected Minecraft version': null,
        'Custom Java arguments': null,
        'RAM allocated': null,
        'Graphics device': null,
        'MOJO_RENDERER': null,
        'JAVA_HOME': null,
    };
    const lines = logContent.split('\n');
    const patterns = {
        'Launcher version': 'Info: Launcher version:',
        'Architecture': 'Info: Architecture:',
        'Device model': 'Info: Device model:',
        'API version': 'Info: API version:',
        'Selected Minecraft version': 'Info: Selected Minecraft version:',
        'Custom Java arguments': 'Info: Custom Java arguments:',
        'RAM allocated': 'Info: RAM allocated:',
        'Graphics device': 'Info: Graphics device:',
        'MOJO_RENDERER': 'Added custom env: MOJO_RENDERER=',
        'JAVA_HOME': 'Added custom env: JAVA_HOME=',
    };
    for (const line of lines) {
        for (const [key, pattern] of Object.entries(patterns)) {
            const patternIndex = line.indexOf(pattern);
            if (patternIndex !== -1) {
                let value = line.substring(patternIndex + pattern.length).trim();
                if (key === 'JAVA_HOME') {
                    const parts = value.split('/');
                    value = parts[parts.length - 1] || value;
                } else if (key === 'Graphics device') {
                    value = value.trim();
                } else if (key === 'Custom Java arguments') {
                    value = value.replace(/^"|"$/g, '');
                }
                if (results[key] === null) {
                    results[key] = value;
                }
                break;
            }
        }
    }
    return results;
}
// получает часть с краш репортом
function extractCrashInfo(logContent) {
    const crashReportMarker = '---- Minecraft Crash Report ----';
    const markerIndex = logContent.indexOf(crashReportMarker);

    if (markerIndex === -1) return null;

    const crashReportContent = logContent.substring(markerIndex);
    const lines = crashReportContent.split('\n');

    const crashInfo = {
        description: null,
        mainException: null,
        mainStackTrace: [],
        causedByException: null,
        causedByStackTrace: [],
    };
    const stackTraceLimit = 5;
    let foundDescription = false, foundMainException = false, foundCausedBy = false, collectMainStackTrace = false, collectCausedByStackTrace = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        if (!foundDescription && trimmedLine.startsWith('Description:')) {
            crashInfo.description = trimmedLine.substring('Description:'.length).trim();
            foundDescription = true;
            continue;
        }
        if (foundDescription && !foundMainException && !trimmedLine.startsWith('at ') && !trimmedLine.startsWith('---') && !trimmedLine.startsWith('Time:') && !trimmedLine.startsWith('//') && trimmedLine.match(/^([\w\.\$]+(?:Exception|Error|RuntimeException|LinkageError|InvocationTargetException)[:\s].*)/)) {
            const nextLineTrimmed = (i + 1 < lines.length) ? lines[i + 1].trim() : '';
            if (nextLineTrimmed.startsWith('at ') || nextLineTrimmed.startsWith('--') || nextLineTrimmed === '' || nextLineTrimmed.startsWith('A detailed walkthrough')) {
                crashInfo.mainException = trimmedLine;
                foundMainException = true;
                collectMainStackTrace = true;
                continue;
            }
        }
        if (!foundCausedBy && trimmedLine.startsWith('Caused by:')) {
            crashInfo.causedByException = trimmedLine.substring('Caused by:'.length).trim();
            foundCausedBy = true;
            collectCausedByStackTrace = true;
            collectMainStackTrace = false;
            continue;
        }
        if (collectMainStackTrace && crashInfo.mainStackTrace.length < stackTraceLimit && trimmedLine.startsWith('at ')) {
            crashInfo.mainStackTrace.push(line);
            continue;
        } else if (collectMainStackTrace && !trimmedLine.startsWith('at ') && trimmedLine !== '' && !trimmedLine.startsWith('Caused by:')) {
            collectMainStackTrace = false;
        }
        if (collectCausedByStackTrace && crashInfo.causedByStackTrace.length < stackTraceLimit && trimmedLine.startsWith('at ')) {
            crashInfo.causedByStackTrace.push(line);
            continue;
        } else if (collectCausedByStackTrace && !trimmedLine.startsWith('at ') && trimmedLine !== '' && !trimmedLine.startsWith('... ')) {
            collectCausedByStackTrace = false;
        }
        if (trimmedLine.startsWith('A detailed walkthrough')) break;
    }
    if (!crashInfo.mainException && !crashInfo.causedByException) return null;
    return crashInfo;
}

// парсит объект сообщения, ищет имя файла(которое указано в targetFilename) и если находит, то скачивает и возвращает текст
async function FindTxtInMessage(message, targetFilename = null) {
    if (message.attachments.size === 0) return null;
    let targetAttachment = null;
    if (targetFilename) {
        targetAttachment = message.attachments.find(att => 
            att.name?.toLowerCase().includes(targetFilename.toLowerCase()) && att.name?.endsWith('.txt')
        );
        if (!targetAttachment) {
            if (!message.attachments.some(att => att.name?.endsWith('.txt'))) return null;
            return null;
        }
    } else {
        targetAttachment = message.attachments.find(att => att.name?.endsWith('.txt'));
        if (!targetAttachment) return null;
    }
    try {
        const url = targetAttachment.url;
        const response = await fetch(url);
        if (!response.ok) return null;
        const fileContent = await response.text();
        return fileContent;
    } catch (error) {
        console.error('Ошибка чтения вложения:', error);
        return null;
    }
}

function extractPotentialSolutions(logContent) {
    const potentialSolutions = [];
    if (logContent.includes('compiled by a more recent version of the Java Runtime')) {
        const isJavaVersionError = analyzeJavaVersionError(logContent);
        if (isJavaVersionError.includes("Используйте")) {
            potentialSolutions.push(isJavaVersionError);
        }
    } else {
        return null;
    }
    return potentialSolutions.length > 0 ? potentialSolutions : null;
}

module.exports = {
    extractLogInfo,
    extractCrashInfo,
    FindTxtInMessage,
    extractPotentialSolutions
}


// Маппинг версий class file на версии Java
const classVersionToJava = {
    45: 1.1,
    46: 1.2,
    47: 1.3,
    48: 1.4,
    49: 5,
    50: 6,
    51: 7,
    52: 8,
    53: 9,
    54: 10,
    55: 11,
    56: 12,
    57: 13,
    58: 14,
    59: 15,
    60: 16,
    61: 17,
    62: 18,
    63: 19,
    64: 20,
    65: 21,
    66: 22,
    67: 23
};

function analyzeJavaVersionError(errorText) {
    const isVersionError = errorText.includes('UnsupportedClassVersionError') || 
                          errorText.includes('has been compiled by a more recent version of the Java Runtime');
    
    if (!isVersionError) {
        return null;
    }
    const versionMatch = errorText.match(/class file version (\d+(?:\.\d+)?)/);
    
    if (!versionMatch) {
        return "Не удалось определить требуемую версию Java из ошибки";
    }
    
    const classVersion = parseFloat(versionMatch[1]);
    const requiredJavaVersion = classVersionToJava[classVersion];
    
    if (!requiredJavaVersion) {
        return `Неизвестная версия class file: ${classVersion}`;
    }
    
    // Форматируем версию Java для вывода
    const javaVersionString = requiredJavaVersion < 5 ? 
        `${requiredJavaVersion}` : 
        `${requiredJavaVersion}`;
    
    return `Используйте Java ${javaVersionString}`;
}