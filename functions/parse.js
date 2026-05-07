/**
 * Извлекает системную информацию из начала лога
 */
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
    };

    for (const line of lines) {
        for (const [key, pattern] of Object.entries(patterns)) {
            if (results[key] !== null) continue; // Если уже нашли, пропускаем

            const patternIndex = line.indexOf(pattern);
            if (patternIndex !== -1) {
                let value = line.substring(patternIndex + pattern.length).trim();
                
                if (key === 'JAVA_HOME') {
                    const parts = value.split('/');
                    value = parts[parts.length - 1] || value;
                } else if (key === 'Custom Java arguments') {
                    value = value.replace(/^"|"$/g, '');
                }
                
                results[key] = value;
                break;
            }
        }
    }
    return results;
}

/**
 * Извлекает информацию о краше
 */
function extractCrashInfo(logContent) {
    const crashReportMarker = '---- Minecraft Crash Report ----';
    const markerIndex = logContent.indexOf(crashReportMarker);

    if (markerIndex !== -1) {
        const crashReportContent = logContent.substring(markerIndex);
        const lines = crashReportContent.split('\n');

        const crashInfo = {
            description: null,
            mainException: null,
            mainExceptionStack: [],
            causedByException: null,
            causedByExceptionStack: []
        };

        let nextLineIsStack = false;
        let stackLines = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            
            if (!crashInfo.description && trimmed.startsWith('Description:')) {
                crashInfo.description = trimmed.substring('Description:'.length).trim();
            }
            
            if (!crashInfo.mainException && !trimmed.startsWith('at ') && !trimmed.startsWith('//') && !trimmed.startsWith('Description:') && trimmed.length > 5) {
                if (trimmed.match(/^([\w\.\$]+(?:Exception|Error|RuntimeException)[:\s].*)/)) {
                    crashInfo.mainException = trimmed;
                    nextLineIsStack = true;
                }
            }

            if (!crashInfo.causedByException && trimmed.startsWith('Caused by:')) {
                crashInfo.causedByException = trimmed.substring('Caused by:'.length).trim();
                nextLineIsStack = true;
                stackLines = 0; 
            }

            if (nextLineIsStack && (trimmed.startsWith('at ') || trimmed.startsWith('//')) && trimmed.length > 5) {
                if (stackLines <= 3) {
                    crashInfo.causedByException 
                        ? crashInfo.causedByExceptionStack.push("\n" + trimmed) 
                        : crashInfo.mainExceptionStack.push("\n" + trimmed);
                    stackLines++;
                } else {
                    stackLines = 0; 
                    nextLineIsStack = false;
                }
            }
        }
        return crashInfo;
    }

    const mainCrashMatch = logContent.match(/^Exception in thread "main" (.+)/m);
    
    if (mainCrashMatch) {
        const crashInfo = {
            description: "Critical Bootstrap Error",
            mainException: mainCrashMatch[1].trim(),
            mainExceptionStack: [],
            causedByException: null,
            causedByExceptionStack: []
        };

        const matchIndex = mainCrashMatch.index;
        const remainingLog = logContent.substring(matchIndex);
        const lines = remainingLog.split(/\r?\n/);

        let stackCount = 0;
        for (let i = 1; i < lines.length; i++) {
            const trimmed = lines[i].trim();
            
            if (trimmed.startsWith('at ')) {
                if (stackCount < 10) {
                    crashInfo.mainExceptionStack.push("\n" + trimmed);
                    stackCount++;
                }
            } else if (trimmed !== '') {
                break;
            }
        }
        
        return crashInfo;
    }
    return null;
}

/**
 * Анализ версий Java (Class version error)
 */
const classVersionToJava = {
    52: 8, 53: 9, 54: 10, 55: 11, 56: 12, 57: 13, 58: 14, 
    59: 15, 60: 16, 61: 17, 62: 18, 63: 19, 64: 20, 65: 21
};

function analyzeJavaVersionError(errorText) {
    if (!errorText.includes('UnsupportedClassVersionError') && 
        !errorText.includes('has been compiled by a more recent version')) return null;

    const versionMatch = errorText.match(/class file version (\d+(?:\.\d+)?)/);
    if (!versionMatch) return "Обновите Java. Не удалось определить точную версию.";

    const classVersion = parseFloat(versionMatch[1]);
    const required = classVersionToJava[classVersion];
    
    return required ? `Используйте Java ${required}` : `Неизвестная версия class file: ${classVersion}`;
}

function extractPotentialSolutions(logContent) {
    const solutions = [];
    const nativeCrash = extractNativeCrashInfo(logContent);
    const modList = extractModList(logContent);
    
    if (logContent.includes('compiled by a more recent version') || logContent.includes('UnsupportedClassVersionError')) {
        const javaSol = analyzeJavaVersionError(logContent);
        if (javaSol) solutions.push(javaSol);
    }
    if (logContent.includes('[authlib-injector] [ERROR]') && logContent.includes('ely.by')) solutions.push('Система скинов ely.by временно недоступна. Используйте другой тип аккаунта либо подождите, пока всё не придёт в норму');
    if (logContent.includes('GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT')) solutions.push('Смените визуализатор на LTW');

    if (nativeCrash && nativeCrash.frame) {
        if (nativeCrash.frame.includes('libOSMesa.so')) {
            solutions.push('Смените визуализатор с Zink на другой');
        }
        if (nativeCrash.frame.includes('libmali.so') || nativeCrash.frame.includes('libAdreno')) {
            solutions.push('Не точно: проблема драйвера. В случае Adreno попробуйте включить/включить использование Turnip в настройках графики лаунчера. В ином случае не используйте шейдеры или попробуйте сменить визуализатор.');
        }
        if (nativeCrash.frame.includes('libgl4es') && modList.includes('sodium')) {
            solutions.push('Смените визуализатор на LTW');
        }
        if (nativeCrash.frame.includes('libc.so') || ['MESA:', 'Shader conversion failed!'].includes(logContent)) {
            solutions.push('Вероятнее всего: Ошибка компиляции шейдеров. Это может возникать при попытке ресурпака (включая серверного) или шейдера использовать неподдерживаемые функции вашего устройства. Это также может возникать при использовании некоторых модов, например, Create. Точного решения нет, не играйте на хламных серверах.')
        }
    }

    return solutions.length > 0 ? solutions : null;
}

function extractModList(logContent) {
    const mods = [];
    const lines = logContent.split(/\r?\n/);
    let isScanningMods = false;

    const cleanModName = (fileName) => {
        let name = fileName.replace(/\.jar$/, '');
        const versionSeparator = /-(?:v?\d|forge|fabric|quilt|mc)/i;
        
        const match = name.match(versionSeparator);
        if (match) {
            return name.substring(0, match.index);
        }
        
        return name;
    };

    for (const line of lines) {
        const forgeMatch = line.match(/Found mod file\s+(.+?)\.jar\s+of type MOD/);
        if (forgeMatch && forgeMatch[1]) {
            mods.push(cleanModName(forgeMatch[1].trim()));
            continue;
        }

        if (line.includes('Loading') && line.includes('mods:')) {
            isScanningMods = true;
            continue;
        }

        if (isScanningMods) {
            if (/^\[\d{2}:\d{2}:\d{2}\]/.test(line)) {
                break;
            }

            const trimmedLine = line.trim();
            if (trimmedLine.startsWith('- ')) {
                const parts = trimmedLine.split(/\s+/);
                if (parts.length >= 2) {
                    mods.push(parts[1]);
                }
            }
        }
    }
    return [...new Set(mods)];
}

function extractNativeCrashInfo(logContent) {
    const tail = logContent.slice(-4000); 

    if (!tail.includes('A fatal error has been detected by the Java Runtime Environment')) {
        return null;
    }

    const info = {
        signal: null,
        frame: null,
        errorFile: null
    };

    const sigMatch = tail.match(/#\s+(SIG\w+\s+\(0x[0-9a-fA-F]+\).*)/);
    if (sigMatch) {
        info.signal = sigMatch[1].trim();
    }

    const frameMatch = tail.match(/# Problematic frame:\r?\n#\s+(.+)/);
    if (frameMatch) {
        info.frame = frameMatch[1].trim();
    }

    const fileMatch = tail.match(/# An error report file with more information is saved as:\r?\n#\s+(.+)/);
    if (fileMatch) {
        info.errorFile = fileMatch[1].trim();
    }

    return info;
}

module.exports = {
    extractLogInfo,
    extractCrashInfo,
    extractPotentialSolutions,
    extractNativeCrashInfo,
    extractModList
};