const localeManager = require('../locales/localeManager');

const classVersionToJava = {
    52: 8, 53: 9, 54: 10, 55: 11, 56: 12, 57: 13, 58: 14, 
    59: 15, 60: 16, 61: 17, 62: 18, 63: 19, 64: 20, 65: 21, 66: 22, 67: 23, 68: 24, 69: 25, 70: 26
};

class LogParser {
    constructor(logContent, lang = 'ru') {
        this.rawContent = logContent;
        this.lang = lang;
        this.content = this.normalizeLog(logContent);
        this.lines = this.content.split('\n');
        
        this.sysInfo = {};
        this.loader = 'vanilla'; // По умолчанию
        this.modList =[];
        this.crashInfo = null;
        this.nativeCrashInfo = null;
        this.solutions =[];
    }

    /**
     * Шаг 1: Приведение лога к единому виду
     * Очищаем мусорные пробелы, приводим переносы к \n, но оставляем табуляцию/отступы
     */
    normalizeLog(text) {
        return text
            .replace(/\r\n/g, '\n')           // Унификация переносов
            .replace(/[ \t]+$/gm, '')         // Удаление пробелов в конце строк
            .replace(/\n{3,}/g, '\n\n');      // Схлопывание множества пустых строк
    }

    /**
     * Главный метод, запускающий цепочку парсинга
     */
    parse() {
        this.extractSysInfo();
        this.determineLoader();
        this.extractModList();
        this.extractCrashInfo();
        this.extractNativeCrashInfo();
        this.extractPotentialSolutions();

        return {
            system: this.sysInfo,
            loader: this.loader,
            crash: this.crashInfo,
            nativeCrash: this.nativeCrashInfo,
            mods: this.modList,
            solutions: this.solutions.length > 0 ? this.solutions : null
        };
    }

    /**
     * Шаг 2: Извлечение системной информации из начала лога
     */
    extractSysInfo() {
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
            'JAVA_HOME': 'Added custom env: JAVA_HOME='
        };

        // Заполняем null по умолчанию
        Object.keys(patterns).forEach(key => this.sysInfo[key] = null);

        // Ищем только в первых 100 строках для оптимизации
        const headerLines = this.lines.slice(0, 100);

        for (const line of headerLines) {
            for (const [key, pattern] of Object.entries(patterns)) {
                if (this.sysInfo[key] !== null) continue;

                const index = line.indexOf(pattern);
                if (index !== -1) {
                    let value = line.substring(index + pattern.length).trim();
                    
                    if (key === 'JAVA_HOME') {
                        value = value.split('/').pop() || value;
                    } else if (key === 'Custom Java arguments') {
                        value = value.replace(/^"|"$/g, '');
                    }
                    
                    this.sysInfo[key] = value;
                }
            }
        }
    }

    /**
     * Шаг 3: Определение типа загрузчика на основе версии MC
     */
    determineLoader() {
        const mcVersion = this.sysInfo['Selected Minecraft version'] || '';
        const lower = mcVersion.toLowerCase();

        if (lower.includes('fabric')) this.loader = 'fabric';
        else if (lower.includes('neoforge')) this.loader = 'neoforge';
        else if (lower.includes('forge')) this.loader = 'forge';
        else if (lower.includes('quilt')) this.loader = 'quilt';
        else this.loader = 'vanilla';
    }

    /**
     * Шаг 4: Контекстно-зависимый парсинг модов
     */
    extractModList() {
        const mods = new Set();
        let isScanning = false;

        const cleanModName = (name) => {
            name = name.replace(/\.jar$/, '');
            const match = name.match(/-(?:v?\d|forge|fabric|quilt|mc)/i);
            return match ? name.substring(0, match.index) : name;
        };

        for (const line of this.lines) {
            switch (this.loader) {
                case 'fabric':
                case 'quilt':
                    // Паттерн: Loading 123 mods: \n - modid 1.0.0 \n - anothermod 2.0
                    if (line.includes('Loading') && line.includes('mods:')) {
                        isScanning = true;
                        continue;
                    }
                    if (isScanning) {
                        // Если пошло время (след. лог) - список закончился
                        if (/^\[\d{2}:\d{2}:\d{2}\]/.test(line)) {
                            isScanning = false;
                            break; 
                        }
                        const trimmed = line.trim();
                        if (trimmed.startsWith('- ')) {
                            const parts = trimmed.split(/\s+/);
                            if (parts.length >= 2) mods.add(parts[1]);
                        }
                    }
                    break;

                case 'forge':
                case 'neoforge':
                    // Паттерн 1: Found mod file xxx.jar of type MOD
                    const forgeMatch = line.match(/Found mod file\s+(.+?)\.jar\s+of type MOD/);
                    if (forgeMatch && forgeMatch[1]) {
                        mods.add(cleanModName(forgeMatch[1].trim()));
                    }
                    
                    // Паттерн 2 (NeoForge/Новый Forge): Могут писать таблицу модов при краше или загрузке
                    const neoMatch = line.match(/\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|\s*([^\|]+)\s*\|\s*(?:DONE|ERROR|COMMON_SET)/);
                    if (neoMatch && !neoMatch[1].includes('State') && !neoMatch[1].includes('Mod ID')) {
                        mods.add(neoMatch[1].trim());
                    }
                    break;
            }
        }
        
        this.modList = Array.from(mods);
    }

    /**
     * Извлечение стандартных крашей Java / Minecraft
     */
    extractCrashInfo() {
        const markerIndex = this.content.indexOf('---- Minecraft Crash Report ----');

        if (markerIndex !== -1) {
            const lines = this.content.substring(markerIndex).split('\n');
            this.crashInfo = { description: null, mainException: null, mainExceptionStack:[], causedByException: null, causedByExceptionStack:[] };
            
            let nextLineIsStack = false, stackLines = 0;

            for (const line of lines) {
                const trimmed = line.trim();
                
                if (!this.crashInfo.description && trimmed.startsWith('Description:')) {
                    this.crashInfo.description = trimmed.substring('Description:'.length).trim();
                }
                if (!this.crashInfo.mainException && !trimmed.startsWith('at ') && !trimmed.startsWith('//') && !trimmed.startsWith('Description:') && trimmed.length > 5) {
                    if (trimmed.match(/^([\w\.\$]+(?:Exception|Error|RuntimeException)[:\s].*)/)) {
                        this.crashInfo.mainException = trimmed;
                        nextLineIsStack = true;
                    }
                }
                if (!this.crashInfo.causedByException && trimmed.startsWith('Caused by:')) {
                    this.crashInfo.causedByException = trimmed.substring('Caused by:'.length).trim();
                    nextLineIsStack = true;
                    stackLines = 0; 
                }
                if (nextLineIsStack && (trimmed.startsWith('at ') || trimmed.startsWith('//')) && trimmed.length > 5) {
                    if (stackLines <= 3) {
                        this.crashInfo.causedByException 
                            ? this.crashInfo.causedByExceptionStack.push("\n" + trimmed) 
                            : this.crashInfo.mainExceptionStack.push("\n" + trimmed);
                        stackLines++;
                    } else {
                        stackLines = 0; nextLineIsStack = false;
                    }
                }
            }
            return;
        }

        // Альтернативный поиск критического Bootstrap Error
        const mainCrashMatch = this.content.match(/^Exception in thread "main" (.+)/m);
        if (mainCrashMatch) {
            this.crashInfo = { description: "Critical Bootstrap Error", mainException: mainCrashMatch[1].trim(), mainExceptionStack: [], causedByException: null, causedByExceptionStack:[] };
            const remainingLines = this.content.substring(mainCrashMatch.index).split('\n');
            let stackCount = 0;

            for (let i = 1; i < remainingLines.length; i++) {
                const trimmed = remainingLines[i].trim();
                if (trimmed.startsWith('at ')) {
                    if (stackCount < 10) {
                        this.crashInfo.mainExceptionStack.push("\n" + trimmed);
                        stackCount++;
                    }
                } else if (trimmed !== '') break;
            }
        }
    }

    /**
     * Извлечение нативных (C++/JNI) крашей
     */
    extractNativeCrashInfo() {
        const tail = this.content.slice(-4000); 
        if (!tail.includes('A fatal error has been detected by the Java Runtime Environment')) return;

        this.nativeCrashInfo = { signal: null, frame: null, errorFile: null };

        const sigMatch = tail.match(/#\s+(SIG\w+\s+\(0x[0-9a-fA-F]+\).*)/);
        if (sigMatch) this.nativeCrashInfo.signal = sigMatch[1].trim();

        const frameMatch = tail.match(/# Problematic frame:\n#\s+(.+)/);
        if (frameMatch) this.nativeCrashInfo.frame = frameMatch[1].trim();

        const fileMatch = tail.match(/# An error report file with more information is saved as:\n#\s+(.+)/);
        if (fileMatch) this.nativeCrashInfo.errorFile = fileMatch[1].trim();
    }

    /**
     * Генерация решений на основе собранных данных
     */
    extractPotentialSolutions() {
        if (this.content.includes('compiled by a more recent version') || this.content.includes('UnsupportedClassVersionError')) {
            const versionMatch = this.content.match(/class file version (\d+(?:\.\d+)?)/);
            if (versionMatch) {
                const required = classVersionToJava[parseFloat(versionMatch[1])];
                this.solutions.push(required 
                    ? localeManager.get('parser.solutions.java_version', this.lang, { version: required }) 
                    : localeManager.get('parser.solutions.java_unknown', this.lang));
            } else {
                this.solutions.push(localeManager.get('parser.solutions.java_undetermined', this.lang));
            }
        }

        if (this.content.includes('[authlib-injector] [ERROR]') && this.content.includes('ely.by')) {
            this.solutions.push(localeManager.get('parser.solutions.ely_by', this.lang));
        }

        if (this.content.includes('GL_FRAMEBUFFER_INCOMPLETE_ATTACHMENT')) {
            this.solutions.push(localeManager.get('parser.solutions.ltw_renderer', this.lang));
        }

        if (this.nativeCrashInfo && this.nativeCrashInfo.frame) {
            const frame = this.nativeCrashInfo.frame;
            if (frame.includes('libOSMesa.so')) {
                this.solutions.push(localeManager.get('parser.solutions.zink_other', this.lang));
            }
            if (frame.includes('libmali.so') || frame.includes('libAdreno')) {
                this.solutions.push(localeManager.get('parser.solutions.driver_adreno', this.lang));
            }
            if (frame.includes('libgl4es') && this.modList.includes('sodium')) {
                this.solutions.push(localeManager.get('parser.solutions.sodium_gl4es', this.lang));
            }
            if (frame.includes('libc.so') || this.content.includes('MESA:') || this.content.includes('Shader conversion failed!')) {
                this.solutions.push(localeManager.get('parser.solutions.shader_error', this.lang));
            }
        }
    }
}

// Статические функции для обратной совместимости
async function FindTxtInMessage(message, fileNamePattern) {
    const attachment = message.attachments.find(att => new RegExp(fileNamePattern, 'i').test(att.name));
    if (!attachment) return null;
    try {
        const response = await fetch(attachment.url);
        return await response.text();
    } catch (err) {
        console.error('Error in FindTxtInMessage:', err);
        return null;
    }
}

function extractLogInfo(logText, lang = 'ru') {
    const parser = new LogParser(logText, lang);
    const result = parser.parse();
    return result.system;
}

function extractCrashInfo(logText, lang = 'ru') {
    const parser = new LogParser(logText, lang);
    const result = parser.parse();
    return result.crash;
}

function extractPotentialSolutions(logText, lang = 'ru') {
    const parser = new LogParser(logText, lang);
    const result = parser.parse();
    return result.solutions;
}

module.exports = {
    LogParser,
    FindTxtInMessage,
    extractLogInfo,
    extractCrashInfo,
    extractPotentialSolutions
};