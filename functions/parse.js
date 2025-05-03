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
            att.name?.toLowerCase() === targetFilename.toLowerCase() && att.name?.endsWith('.txt')
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

// ищет возможные решения ошибок типа "установить мод"
function extractPotentialSolutions(logContent) {
    const potentialSolutions = [];

    const solutionMarker = "A potential solution has been determined, this may resolve your problem:";
    const detailsMarker = "More details:";

    const solutionIndex = logContent.indexOf(solutionMarker);
    if (solutionIndex === -1) return null;

    const afterSolution = logContent.substring(solutionIndex + solutionMarker.length).trim();
    const lines = afterSolution.split('\n');

    let collectingSolutions = false;
    let collectingDetails = false;
    let solutionText = '';
    let detailsText = '';

    for (const line of lines) {
        const trimmed = line.trim();

        if (!collectingSolutions && trimmed.startsWith('-')) {
            collectingSolutions = true;
        }

        if (collectingSolutions) {
            if (trimmed.startsWith('More details:')) {
                collectingSolutions = false;
                collectingDetails = true;
                continue;
            }
            solutionText += trimmed + '\n';
        } else if (collectingDetails) {
            if (trimmed === '' || trimmed.startsWith('at ') || trimmed.startsWith('A detailed walkthrough')) {
                break;
            }
            detailsText += trimmed + '\n';
        }
    }

    potentialSolutions.push({
        solution: solutionText.trim(),
        details: detailsText.trim()
    });

    return potentialSolutions.length > 0 ? potentialSolutions : null;
}

module.exports = {
    extractLogInfo,
    extractCrashInfo,
    FindTxtInMessage,
    extractPotentialSolutions
}
