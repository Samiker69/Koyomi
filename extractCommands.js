const fs = require('fs');
const path = require('path');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const commandsPath = path.join(__dirname, 'commands'); // Убедитесь, что путь верный
const output = {
    commands: {}
};

/**
 * Рекурсивно обходит цепочку вызовов (например, .setName(...).setDescription(...))
 * и извлекает из нее данные в виде объекта.
 * @param {object} callExpressionNode - Узел AST типа CallExpression.
 * @returns {object} - Объект с извлеченными данными.
 */
function parseCommandChain(callExpressionNode) {
    const commandData = {};
    let currentNode = callExpressionNode;
    let isSubcommand = false;

    // Рекурсивно поднимаемся по цепочке вызовов, пока не дойдем до new SlashCommandBuilder()
    while (currentNode && currentNode.type === 'CallExpression') {
        const callee = currentNode.callee;
        if (callee.type !== 'MemberExpression') break;

        const methodName = callee.property.name;
        const args = currentNode.arguments;

        // Обработка подкоманд и опций, которые принимают функцию
        if ((methodName.startsWith('addSubcommand') || methodName.startsWith('add') && methodName.endsWith('Option')) && args[0] && args[0].type === 'ArrowFunctionExpression') {
            const optionBuilderBody = args[0].body;
            // Рекурсивно парсим вложенную цепочку для опции/подкоманды
            const nestedData = parseCommandChain(optionBuilderBody);
            
            const optionName = nestedData.name;
            if (!commandData.options) {
                commandData.options = {};
            }
            commandData.options[optionName] = nestedData;

        } else if (args[0] && args[0].type === 'StringLiteral') {
            // Обработка простых методов типа setName('имя')
            commandData[methodName.replace('set', '').toLowerCase()] = args[0].value;
        }

        currentNode = callee.object; // Переходим к предыдущему звену в цепочке
    }

    return commandData;
}

/**
 * Рекурсивно читает файлы команд, парсит их и извлекает данные.
 * @param {string} dirPath - Путь к директории.
 */
function readCommands(dirPath) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            readCommands(filePath);
        } else if (file.endsWith('.js')) {
            try {
                const code = fs.readFileSync(filePath, 'utf-8');
                const ast = parser.parse(code, {
                    sourceType: 'script',
                    plugins: ['jsx']
                });

                traverse(ast, {
                    // Ищем объявление переменной `data`, например `const data = new SlashCommandBuilder()`
                    VariableDeclarator(path) {
                        if (path.node.id.name === 'data' && path.node.init.type === 'CallExpression') {
                            console.log(`1. Парсим команду из файла: ${filePath} (const data = ...)`);
                            const commandJson = parseCommandChain(path.node.init);
                            
                            // Форматируем результат под вашу структуру
                            const commandName = commandJson.name;
                            const finalStructure = {
                                name: commandJson.name,
                                description: commandJson.description,
                                response: {},
                                options: commandJson.options || {}
                            };

                            output.commands[commandName] = finalStructure;
                        }
                    },
                    // Обработка для module.exports = { data: new SlashCommandBuilder() }
                    ExpressionStatement(path) {
                        const expression = path.node.expression;
                        if (expression.type === 'AssignmentExpression' &&
                            expression.left.type === 'MemberExpression' &&
                            expression.left.object.type === 'Identifier' &&
                            expression.left.object.name === 'module' &&
                            expression.left.property.type === 'Identifier' &&
                            expression.left.property.name === 'exports' &&
                            expression.right.type === 'ObjectExpression') {

                            for (const property of expression.right.properties) {
                                if (property.type === 'ObjectProperty' &&
                                    property.key.type === 'Identifier' &&
                                    property.key.name === 'data' &&
                                    property.value.type === 'CallExpression') {
                                    
                                    console.log(`2. Парсим команду из файла: ${filePath} (module.exports = { data: ... })`);
                                    const commandJson = parseCommandChain(property.value);
                                    
                                    const commandName = commandJson.name;
                                    const finalStructure = {
                                        name: commandJson.name,
                                        description: commandJson.description,
                                        response: {},
                                        options: commandJson.options || {}
                                    };

                                    output.commands[commandName] = finalStructure;
                                }
                            }
                        }
                    }
                });
            } catch (error) {
                console.error(`Ошибка при статическом анализе файла ${filePath}:`, error.message);
            }
        }
    }
}

try {
    readCommands(commandsPath);
    const jsonOutput = JSON.stringify(output, null, 4);
    fs.writeFileSync('commands.json', jsonOutput);
    console.log('Данные команд успешно извлечены через AST и сохранены в commands.json');
} catch (error) {
    console.error('Произошла глобальная ошибка:', error);
}