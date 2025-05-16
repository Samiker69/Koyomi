/**
 * @param {String} args - выражение. пример: 2+2+8*2/21^2
 * @returns {Number|String} вернёт число, если всё решено правильно, иначе вернёт строку с ошибкой
 */
function calc(expression) {
    if (typeof expression !== 'string' || expression.trim() === "") {
        return "Пустое выражение или неверный тип аргумента.";
    }

    const sanitizedExpression = expression.replace(/\s+/g, '');

    const tokens = [];
    let currentNumber = "";

    for (let i = 0; i < sanitizedExpression.length; i++) {
        const char = sanitizedExpression[i];
        const prevToken = tokens[tokens.length - 1];

        if (!isNaN(parseInt(char)) || char === '.') {
            currentNumber += char;
        } else if (char === '-' && 
                   (currentNumber === "") && // Минус в начале числа
                   (tokens.length === 0 || ['+', '-', '*', '/', '^', '**'].includes(prevToken))) {
            currentNumber += char; // Это часть отрицательного числа
        } else {
            if (currentNumber) {
                const num = parseFloat(currentNumber);
                if (isNaN(num)) return `Неверный формат числа '${currentNumber}'`;
                tokens.push(num);
                currentNumber = "";
            }

            if (char === '*' && sanitizedExpression[i + 1] === '*') {
                tokens.push('**');
                i++; // Пропускаем следующий символ '*'
            } else if (['+', '-', '*', '/', '^'].includes(char)) {
                tokens.push(char);
            } else {
                return `Недопустимый символ '${char}' в выражении.`;
            }
        }
    }
    if (currentNumber) {
        const num = parseFloat(currentNumber);
        if (isNaN(num)) return `Неверный формат числа '${currentNumber}'`;
        tokens.push(num);
    }

    if (tokens.length === 0) {
        return "Выражение не содержит чисел или операторов.";
    }

    // 2. Валидация токенов
    // Оператор не может быть в начале/конце (кроме унарного минуса, который уже обработан в числе)
    if (typeof tokens[0] !== 'number' || typeof tokens[tokens.length - 1] !== 'number') {
        return "Выражение не может начинаться или заканчиваться оператором (после обработки унарного минуса).";
    }

    // Проверка на два оператора подряд или два числа подряд
    let expectNumber = true;
    for (const token of tokens) {
        if (expectNumber) {
            if (typeof token !== 'number') return "Ожидалось число, но получен оператор.";
        } else {
            if (typeof token !== 'string') return "Ожидался оператор, но получено число.";
        }
        expectNumber = !expectNumber;
    }
    // Если expectNumber === true в конце, значит, последний был оператор, что уже проверено выше.
    // Если expectNumber === false, значит, выражение заканчивается числом, что корректно.


    // 3. Вычисление с учетом приоритета операций
    const applyOp = (a, op, b) => {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/':
                if (b === 0) throw new Error("Деление на ноль!");
                return a / b;
            case '^':
            case '**': // ** - это стандартный оператор возведения в степень в JS
                return Math.pow(a, b);
            default:
                throw new Error(`Неизвестный оператор '${op}'`);
        }
    };

    const precedence = { '+': 1, '-': 1, '*': 2, '/': 2, '^': 3, '**': 3 };

    // Функция для выполнения операций одного уровня приоритета
    const calculateForPrecedence = (tokens, opsToProcess) => {
        const newTokens = [...tokens]; // Работаем с копией
        let i = 0;
        while (i < newTokens.length) {
            if (typeof newTokens[i] === 'string' && opsToProcess.includes(newTokens[i])) {
                const operator = newTokens[i];
                const left = newTokens[i - 1];
                const right = newTokens[i + 1];

                // Проверка, что операнды - числа (на всякий случай)
                if (typeof left !== 'number' || typeof right !== 'number') {
                    throw new Error(`Некорректные операнды для операции '${operator}'. Ожидались числа.`);
                }

                const result = applyOp(left, operator, right);
                newTokens.splice(i - 1, 3, result); // Заменяем [left, op, right] на result
                i = i - 1; // Смещаем индекс назад, чтобы проверить новую связку
            } else {
                i++;
            }
        }
        return newTokens;
    };
    
    try {
        let currentTokens = [...tokens];
        currentTokens = calculateForPrecedence(currentTokens, ['^', '**']); // 1. Степени
        currentTokens = calculateForPrecedence(currentTokens, ['*', '/']);   // 2. Умножение, Деление
        currentTokens = calculateForPrecedence(currentTokens, ['+', '-']);   // 3. Сложение, Вычитание

        if (currentTokens.length === 1 && typeof currentTokens[0] === 'number') {
            return currentTokens[0];
        } else {
            return "Не удалось полностью вычислить выражение. Остаток: " + currentTokens.join(' ');
        }
    } catch (e) {
        return e.message; 
    }
}

module.exports = {
    calc
}