const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;
const generate = require('@babel/generator').default;
const t = require('@babel/types');

const commandsPath = path.join(__dirname, 'commands'); // Путь к вашим командам
const localeManagerPath = '../../locales/localesManager'; // Относительный путь от файла команды до менеджера

/**
 * Главная функция для рефакторинга файлов в директории.
 * @param {string} dirPath 
 */
function refactorCommands(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            refactorCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                console.log(`\nProcessing file: ${filePath}`);
                const code = fs.readFileSync(filePath, 'utf-8');
                const ast = parser.parse(code, { sourceType: 'script' });

                let commandName = null;
                let modified = false;

                traverse(ast, {
                    // Находим цепочку билдера
                    VariableDeclarator(path) {
                        if (path.node.id.name === 'data' && path.node.init && path.node.init.type === 'CallExpression') {
                            transformBuilderChain(path.get('init'));
                        }
                    },
                    ObjectProperty(path) {
                        if (path.node.key.name === 'data' && path.node.value && path.node.value.type === 'CallExpression') {
                             console.log(`   -> Found SlashCommandBuilder in ObjectProperty for file: ${filePath}`);
                             transformBuilderChain(path.get('value'));
                        }
                    },
                    // Добавляем обработку для module.exports.data = new SlashCommandBuilder()
                    ExpressionStatement(path) {
                        const expression = path.node.expression;
                        if (expression.type === 'AssignmentExpression' &&
                            expression.left.type === 'MemberExpression' &&
                            expression.left.object?.type === 'MemberExpression' &&
                            expression.left.object?.property?.name === 'exports' &&
                            expression.left?.property?.name === 'data' &&
                            expression.right?.type === 'CallExpression') {
                            console.log(`   -> Found SlashCommandBuilder in ExpressionStatement for file: ${filePath}`);
                            transformBuilderChain(path.get('right'));
                        }
                    }
                });

                /**
                 * Трансформирует цепочку вызовов SlashCommandBuilder
                 * @param {NodePath} builderPath - Путь к началу цепочки (new SlashCommandBuilder())
                 */
                function transformBuilderChain(builderPath) {
                    console.log(`   -> Entering transformBuilderChain for file: ${filePath}`);

                    // Первый проход: найти имя основной команды
                    builderPath.traverse({
                        CallExpression(path) {
                            const calleeNode = path.node.callee;
                            let currentMethodName = null;

                            if (calleeNode && calleeNode.type === 'MemberExpression' && calleeNode.property && calleeNode.property.type === 'Identifier') {
                                currentMethodName = calleeNode.property.name;
                            }

                            if (currentMethodName === 'setName' && path.get('arguments.0') && path.get('arguments.0').isStringLiteral()) {
                                // Устанавливаем commandName для первого найденного setName в цепочке билдера
                                // Предполагаем, что это setName основной команды.
                                commandName = path.get('arguments.0').node.value;
                                console.log(`      -> Command Name (first pass) set: ${commandName}`);
                                path.stop(); // Остановить этот обход после нахождения имени основной команды
                            }
                        }
                    });

                    // Второй проход: выполнить рефакторинг, используя найденное commandName
                    if (!commandName) {
                        console.log(`      -> No main command name found, skipping refactoring for file: ${filePath}`);
                        return;
                    }

                    builderPath.traverse({
                        CallExpression(path) {
                            const calleeNode = path.node.callee;
                            let methodName = null;

                            if (calleeNode && calleeNode.type === 'MemberExpression' && calleeNode.property && calleeNode.property.type === 'Identifier') {
                                methodName = calleeNode.property.name;
                            }

                            if (!methodName) {
                                return;
                            }

                            const args = path.get('arguments');

                            // Рефакторинг setName и setDescription для основной команды
                            if ((methodName === 'setName' || methodName === 'setDescription') && args.length > 0 && args[0].isStringLiteral()) {
                                const isNested = path.findParent((p) => {
                                    return p.isCallExpression() &&
                                           p.parentPath.isArrowFunctionExpression() &&
                                           p.parentPath.parentPath.isCallExpression() &&
                                           p.parentPath.parentPath.get('callee').isMemberExpression() &&
                                           p.parentPath.parentPath.get('callee').get('property').node.name?.startsWith('add');
                                });

                                if (!isNested) {
                                    const keyType = methodName === 'setName' ? 'name' : 'description';
                                    const key = `commands.${commandName}.${keyType}`;
                                    args[0].replaceWith(createLmGetStringCall(key));
                                    modified = true;
                                    console.log(`         -> Refactored command ${keyType}: ${key}`);
                                } else {
                                    console.log(`         -> Skipping nested setName/setDescription: ${args[0].node.value}`);
                                }
                            }
                            // Рефакторинг опций
                            else if (methodName.startsWith('add') && methodName.endsWith('Option')) {
                                console.log(`      -> Found option method: ${methodName}`);
                                const optionBody = args[0].get('body');
                                let optionName = null;

                                optionBody.traverse({
                                    CallExpression(optPath) {
                                        const calleeProperty = optPath.get('callee.property');
                                        const firstArgument = optPath.get('arguments.0');

                                        if (calleeProperty.isIdentifier({ name: 'setName' }) && firstArgument && firstArgument.isStringLiteral()) {
                                            optionName = firstArgument.node.value;
                                            const key = `commands.${commandName}.options.${optionName}.name`;
                                            firstArgument.replaceWith(createLmGetStringCall(key));
                                            modified = true;
                                            console.log(`         -> Refactored option name: ${key}`);
                                        }
                                    }
                                });

                                if (optionName) {
                                    optionBody.traverse({
                                        CallExpression(optPath) {
                                            const calleeProperty = optPath.get('callee.property');
                                            const firstArgument = optPath.get('arguments.0');

                                            if (calleeProperty.isIdentifier({ name: 'setDescription' }) && firstArgument && firstArgument.isStringLiteral()) {
                                                const key = `commands.${commandName}.options.${optionName}.description`;
                                                firstArgument.replaceWith(createLmGetStringCall(key));
                                                modified = true;
                                                console.log(`         -> Refactored option description: ${key}`);
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    });
                }

                if (modified) {
                    ensureLocaleManagerImport(ast);
                    const output = generate(ast, { /* опции для форматирования */ });
                    fs.writeFileSync(filePath, output.code);
                    console.log(`✅ File refactored successfully!`);
                } else {
                    console.log(`⏩ Skipping file, no changes needed.`);
                }

            } catch (error) {
                console.error(`❌ Error processing file ${filePath}:`, error);
            }
        }
    }
}

/**
 * Создает узел AST для `lm.getString("key")`
 * @param {string} key 
 */
function createLmGetStringCall(key) {
    return t.callExpression(
        t.memberExpression(t.identifier('lm'), t.identifier('getString')),
        [t.stringLiteral(key)]
    );
}

/**
 * Проверяет наличие импорта и инстанса LocaleManager и добавляет их при необходимости.
 * @param {AST} ast 
 */
function ensureLocaleManagerImport(ast) {
    let hasImport = false;
    let hasInstance = false;

    traverse(ast, {
        VariableDeclarator(path) {
            // Проверяем const localeMamager = require(...)
            if (path.get('init').isCallExpression() && path.get('init.callee').isIdentifier({ name: 'require' })) {
                if (path.get('init.arguments.0').isStringLiteral({ value: localeManagerPath })) {
                    hasImport = true;
                }
            }
            // Проверяем const lm = new localeMamager()
            if (path.get('init').isNewExpression() && path.get('id').isIdentifier({ name: 'lm' })) {
                hasInstance = true;
            }
        }
    });

    if (!hasImport) {
        const importDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(
                t.identifier('localeMamager'),
                t.callExpression(t.identifier('require'), [t.stringLiteral(localeManagerPath)])
            )
        ]);
        ast.program.body.unshift(importDeclaration);
        console.log(`   -> Added LocaleManager require.`);
    }

    if (!hasInstance) {
        const instanceDeclaration = t.variableDeclaration('const', [
            t.variableDeclarator(
                t.identifier('lm'),
                t.newExpression(t.identifier('localeMamager'), [])
            )
        ]);
        // Вставляем после импорта
        ast.program.body.splice(1, 0, instanceDeclaration);
        console.log(`   -> Added 'lm' instance.`);
    }
}


// --- ЗАПУСК ---
console.log("Starting refactoring process. Please ensure you have a backup of your 'commands' directory.");
refactorCommands(commandsPath);
console.log("\nRefactoring process finished.");