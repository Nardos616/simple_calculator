/**
 * Modern Vanilla JavaScript Calculator with Parentheses & Expression Support
 * 
 * Features:
 * 1. Object-Oriented Calculator class separating business logic from DOM presentation.
 * 2. Pure arithmetic computation using Shunting-Yard two-stack parsing (NO eval / new Function).
 * 3. Support for nested parentheses: ( ), auto-closing on compute, implicit multiplication (e.g. 3(4+2)).
 * 4. Standard arithmetic (+, -, ×, ÷), percentage (%), and sign toggle (±).
 * 5. Graceful handling of division by zero and floating-point precision imprecision.
 * 6. Calculation History Drawer with persistent memory and one-click value restoration.
 * 7. Light / Dark Theme Switcher with localStorage persistence.
 * 8. Full keyboard event listeners with visual button press feedback.
 */

class Calculator {
    /**
     * @param {HTMLElement} previousOperandElement - DOM element displaying previous equation / status
     * @param {HTMLElement} currentOperandElement - DOM element displaying active expression or result
     * @param {Function} onHistoryUpdate - Optional callback triggered when a new calculation is recorded
     */
    constructor(previousOperandElement, currentOperandElement, onHistoryUpdate = null) {
        this.previousOperandElement = previousOperandElement;
        this.currentOperandElement = currentOperandElement;
        this.onHistoryUpdate = onHistoryUpdate;
        this.history = [];
        this.clear();
    }

    /**
     * Resets calculator state to defaults.
     */
    clear() {
        this.expression = '0';
        this.previousEquation = '';
        this.isError = false;
        this.overwrite = false;
    }

    /**
     * Deletes the most recent character or operator from the expression.
     */
    delete() {
        if (this.isError) {
            this.clear();
            return;
        }

        if (this.overwrite) {
            this.expression = '0';
            this.overwrite = false;
            return;
        }

        if (this.expression === '0') return;

        // If expression ends with a spaced operator like " + ", remove all 3 characters
        if (/\s[+\-−×*÷/]\s$/.test(this.expression)) {
            this.expression = this.expression.slice(0, -3);
        } else if (this.expression.length <= 1) {
            this.expression = '0';
        } else {
            this.expression = this.expression.slice(0, -1);
        }

        if (this.expression === '') {
            this.expression = '0';
        }
    }

    /**
     * Appends a digit or decimal point to the expression.
     * @param {string} number - The digit (0-9) or decimal point (.)
     */
    appendNumber(number) {
        if (this.isError) {
            this.clear();
        }

        if (this.overwrite) {
            this.expression = number === '.' ? '0.' : number.toString();
            this.overwrite = false;
            return;
        }

        // Decimal point validation
        if (number === '.') {
            // Check the current active number token from the end of the expression
            const lastTokenMatch = this.expression.match(/([0-9.]+)$/);
            if (lastTokenMatch && lastTokenMatch[1].includes('.')) {
                return; // Already has a decimal point in active number
            }

            // If expression ends with an operator, open paren, or is empty, prepend '0.'
            if (this.expression === '0' || this.expression === '') {
                this.expression = '0.';
                return;
            }
            if (/[\s(]$/.test(this.expression)) {
                this.expression += '0.';
                return;
            }
        }

        // Prevent redundant leading zeroes (e.g. "00")
        if (this.expression === '0' && number !== '.') {
            this.expression = number.toString();
            return;
        }

        // If previous character was a closing parenthesis, insert implicit multiplication: )5 -> ) × 5
        if (/\)$/.test(this.expression)) {
            this.expression += ' × ' + number.toString();
            return;
        }

        this.expression += number.toString();
    }

    /**
     * Appends an opening or closing parenthesis.
     * @param {string} paren - Either '(' or ')'
     */
    appendParenthesis(paren) {
        if (this.isError) {
            this.clear();
        }

        if (paren === '(') {
            // Overwrite after equals calculation
            if (this.overwrite) {
                this.expression = '(';
                this.overwrite = false;
                return;
            }

            // If current expression is '0', replace with '('
            if (this.expression === '0') {
                this.expression = '(';
                return;
            }

            // Implicit multiplication: if preceded by a number, decimal, or ')', insert ' × ('
            if (/[0-9.)]$/.test(this.expression)) {
                this.expression += ' × (';
                return;
            }

            this.expression += '(';
            return;
        }

        if (paren === ')') {
            if (this.expression === '0' || this.isError) return;

            // Count open and closed parentheses to prevent unmatched closing parentheses
            const openCount = (this.expression.match(/\(/g) || []).length;
            const closeCount = (this.expression.match(/\)/g) || []).length;

            if (closeCount >= openCount) {
                return; // Cannot close more than what is open
            }

            // Prevent closing immediately after an operator or another open parenthesis: e.g. "5 + )" or "( )"
            if (/[\s(]$/.test(this.expression)) {
                return;
            }

            this.expression += ')';
            this.overwrite = false;
        }
    }

    /**
     * Appends an arithmetic operator (+, −, ×, ÷).
     * @param {string} operation - The chosen mathematical operator
     */
    chooseOperation(operation) {
        if (this.isError) {
            this.clear();
        }

        // Standardize visual symbol
        let opSymbol = operation;
        if (opSymbol === '*') opSymbol = '×';
        if (opSymbol === '/') opSymbol = '÷';
        if (opSymbol === '-') opSymbol = '−';

        // Chain calculation if previously evaluated
        if (this.overwrite) {
            this.overwrite = false;
        }

        // If expression ends with an operator, replace it (e.g. entered + then clicked ×)
        if (/\s[+\-−×*÷/]\s$/.test(this.expression)) {
            this.expression = this.expression.slice(0, -3) + ` ${opSymbol} `;
            return;
        }

        // Allow entering negative number after open parenthesis e.g. "(-"
        if (this.expression.endsWith('(') && opSymbol === '−') {
            this.expression += '−';
            return;
        }

        // Prevent operators at the very start except minus
        if (this.expression === '0' || this.expression === '') {
            if (opSymbol === '−') {
                this.expression = '−';
                return;
            }
            return;
        }

        this.expression += ` ${opSymbol} `;
    }

    /**
     * Toggles the sign (positive/negative) of the active number token.
     */
    toggleSign() {
        if (this.isError || this.expression === '0') return;

        // Find the last number token in the expression
        const match = this.expression.match(/(-?)((\d+(\.\d*)?)|(\.\d+))$/);
        if (!match) return;

        const fullToken = match[0];
        const isNegative = match[1] === '-';
        const numPart = match[2];

        let replacement;
        if (isNegative) {
            replacement = numPart;
        } else {
            replacement = '-' + numPart;
        }

        const prefix = this.expression.slice(0, match.index);
        this.expression = prefix + replacement;
    }

    /**
     * Computes percentage of the active number token.
     */
    percentage() {
        if (this.isError || this.expression === '0') return;

        const match = this.expression.match(/(-?\d+(\.\d+)?)$/);
        if (!match) return;

        const currentVal = parseFloat(match[0]);
        if (isNaN(currentVal)) return;

        const percentVal = this.roundAccurate(currentVal / 100);
        const prefix = this.expression.slice(0, match.index);
        this.expression = prefix + percentVal.toString();
    }

    /**
     * Normalizes floating-point precision to eliminate JavaScript IEEE-754 rounding artifacts.
     * @param {number} num - Raw calculated number
     * @returns {number} Normalized number rounded to safe precision
     */
    roundAccurate(num) {
        return parseFloat(Number(num).toPrecision(12));
    }

    /**
     * Tokenizes an arithmetic expression with parentheses into an array of tokens.
     * @param {string} expr - Expression string
     * @returns {string[]} Array of token strings
     */
    tokenize(expr) {
        const tokens = [];
        let i = 0;
        const len = expr.length;

        while (i -lt len) {
            const ch = expr[i];

            // Ignore whitespace
            if (ch === ' ' || ch === '\t') {
                i++;
                continue;
            }

            // Parentheses
            if (ch === '(' || ch === ')') {
                tokens.push(ch);
                i++;
                continue;
            }

            // Operators: +, −, -, ×, *, ÷, /
            if (['+', '−', '-', '×', '*', '÷', '/'].includes(ch)) {
                // Determine if this is a unary minus (negative number)
                const isMinus = (ch === '-' || ch === '−');
                const prev = tokens.length > 0 ? tokens[tokens.length - 1] : null;
                const isUnary = isMinus && (prev === null || prev === '(' || ['+', '−', '-', '×', '*', '÷', '/'].includes(prev));

                if (isUnary) {
                    // Accumulate negative number
                    let numStr = '-';
                    i++;
                    while (i -lt len && (/[0-9.]/).test(expr[i])) {
                        numStr += expr[i];
                        i++;
                    }
                    tokens.push(numStr);
                    continue;
                }

                const op = (ch === '*' ? '×' : (ch === '/' ? '÷' : (ch === '-' ? '−' : ch)));
                tokens.push(op);
                i++;
                continue;
            }

            // Numbers (integers or decimals)
            if (/[0-9.]/.test(ch)) {
                let numStr = '';
                while (i -lt len && /[0-9.]/.test(expr[i])) {
                    numStr += expr[i];
                    i++;
                }
                tokens.push(numStr);
                continue;
            }

            i++;
        }

        return tokens;
    }

    /**
     * Operator precedence mapping.
     */
    precedence(op) {
        if (op === '+' || op === '−' || op === '-') return 1;
        if (op === '×' || op === '*' || op === '÷' || op === '/') return 2;
        return 0; // For '('
    }

    /**
     * Applies an arithmetic operator to two operands.
     */
    applyOp(op, b, a) {
        switch (op) {
            case '+': return a + b;
            case '-':
            case '−': return a - b;
            case '×':
            case '*': return a * b;
            case '÷':
            case '/':
                if (b === 0) throw new Error("Cannot divide by zero");
                return a / b;
            default: return 0;
        }
    }

    /**
     * Evaluates an arithmetic expression containing parentheses using the Shunting-Yard Two-Stack algorithm.
     * @param {string} expr - Expression string
     * @returns {number} Evaluated result
     */
    evaluateExpression(expr) {
        const tokens = this.tokenize(expr);
        if (tokens.length === 0) return 0;

        // Automatically close any unclosed parentheses
        let openCount = 0;
        tokens.forEach(t => {
            if (t === '(') openCount++;
            if (t === ')') openCount--;
        });
        while (openCount > 0) {
            tokens.push(')');
            openCount--;
        }

        const values = [];
        const ops = [];

        for (let i = 0; i -lt tokens.length; i++) {
            const token = tokens[i];

            // If token is a number
            if (/^-?[0-9]+(\.[0-9]+)?$/.test(token)) {
                values.push(parseFloat(token));
            } else if (token === '(') {
                ops.push(token);
            } else if (token === ')') {
                while (ops.length > 0 && ops[ops.length - 1] !== '(') {
                    const val2 = values.pop();
                    const val1 = values.pop();
                    const op = ops.pop();
                    values.push(this.applyOp(op, val2, val1));
                }
                if (ops.length > 0 && ops[ops.length - 1] === '(') {
                    ops.pop(); // Pop '('
                }
            } else if (['+', '−', '-', '×', '*', '÷', '/'].includes(token)) {
                while (ops.length > 0 && this.precedence(ops[ops.length - 1]) >= this.precedence(token)) {
                    const val2 = values.pop();
                    const val1 = values.pop();
                    const op = ops.pop();
                    values.push(this.applyOp(op, val2, val1));
                }
                ops.push(token);
            }
        }

        while (ops.length > 0) {
            const val2 = values.pop();
            const val1 = values.pop();
            const op = ops.pop();
            values.push(this.applyOp(op, val2, val1));
        }

        if (values.length === 0) return 0;
        return this.roundAccurate(values[0]);
    }

    /**
     * Computes the current expression, stores history, and updates display.
     */
    compute() {
        if (this.isError || this.expression === '') return;

        // Clean trailing operators before evaluation (e.g. "5 + ")
        let cleanExpr = this.expression.trim();
        if (/\s[+\-−×*÷/]$/.test(cleanExpr)) {
            cleanExpr = cleanExpr.slice(0, -2).trim();
        }

        try {
            const result = this.evaluateExpression(cleanExpr);

            // Record equation and result to history
            this.previousEquation = `${cleanExpr} =`;
            this.recordHistory(cleanExpr, result.toString());

            this.expression = result.toString();
            this.overwrite = true;
        } catch (error) {
            this.isError = true;
            this.expression = error.message || 'Error';
            this.previousEquation = '';
        }
    }

    /**
     * Formats numbers for display with comma thousand separators.
     * @param {string|number} value - Value to format
     */
    formatForDisplay(value) {
        if (this.isError) return value;
        if (!value) return '0';

        // Format numbers inside the expression string with localized commas where appropriate
        return value.replace(/\b\d+(\.\d+)?\b/g, (match) => {
            const parts = match.split('.');
            const integerDigits = parseFloat(parts[0]);
            const decimalDigits = parts[1];

            let integerDisplay = isNaN(integerDigits) ? parts[0] : integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
            return decimalDigits != null ? `${integerDisplay}.${decimalDigits}` : integerDisplay;
        });
    }

    /**
     * Records a completed calculation into the history drawer.
     */
    recordHistory(equation, result) {
        this.history.unshift({ equation, result });
        if (this.history.length > 25) {
            this.history.pop();
        }
        if (typeof this.onHistoryUpdate === 'function') {
            this.onHistoryUpdate(this.history);
        }
    }

    /**
     * Restores a previously calculated value from history.
     */
    restoreValue(result) {
        this.clear();
        this.expression = result;
        this.overwrite = true;
        this.updateDisplay();
    }

    /**
     * Clears all recorded calculation history.
     */
    clearHistory() {
        this.history = [];
        if (typeof this.onHistoryUpdate === 'function') {
            this.onHistoryUpdate(this.history);
        }
    }

    /**
     * Updates DOM display elements to mirror current state.
     */
    updateDisplay() {
        if (this.isError) {
            this.currentOperandElement.innerText = this.expression;
            this.currentOperandElement.classList.add('error-state');
            this.previousOperandElement.innerText = '';
            return;
        }

        this.currentOperandElement.classList.remove('error-state');
        this.currentOperandElement.innerText = this.formatForDisplay(this.expression);
        this.previousOperandElement.innerText = this.previousEquation;
    }
}

/* ==========================================================================
   DOM Initialization & Application Wiring
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    const previousOperandElement = document.getElementById('previousOperand');
    const currentOperandElement = document.getElementById('currentOperand');
    const historyPanel = document.getElementById('historyPanel');
    const historyList = document.getElementById('historyList');
    const historyToggleBtn = document.getElementById('historyToggleBtn');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    const themeIcon = document.getElementById('themeIcon');

    // 1. Initialize Calculator Instance with History Callback
    const calculator = new Calculator(previousOperandElement, currentOperandElement, renderHistory);

    // 2. Render History List DOM
    function renderHistory(historyItems) {
        if (historyItems.length === 0) {
            historyList.innerHTML = '<li class="history-empty">No calculations yet</li>';
            return;
        }

        historyList.innerHTML = '';
        historyItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'history-item';
            li.tabIndex = 0;
            li.setAttribute('role', 'button');
            li.setAttribute('aria-label', `${item.equation} equals ${item.result}. Click to restore.`);
            li.innerHTML = `
                <span class="history-equation">${item.equation} =</span>
                <span class="history-result">${calculator.formatForDisplay(item.result)}</span>
            `;

            // Clicking a history entry loads its result into the calculator
            li.addEventListener('click', () => {
                calculator.restoreValue(item.result);
                toggleHistoryDrawer(false);
            });

            // Keyboard accessibility
            li.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    calculator.restoreValue(item.result);
                    toggleHistoryDrawer(false);
                }
            });

            historyList.appendChild(li);
        });
    }

    // Toggle History Drawer
    function toggleHistoryDrawer(forceState = null) {
        const isOpen = forceState !== null ? forceState : !historyPanel.classList.contains('is-open');
        if (isOpen) {
            historyPanel.classList.add('is-open');
            historyPanel.setAttribute('aria-hidden', 'false');
        } else {
            historyPanel.classList.remove('is-open');
            historyPanel.setAttribute('aria-hidden', 'true');
        }
    }

    historyToggleBtn.addEventListener('click', () => toggleHistoryDrawer());
    clearHistoryBtn.addEventListener('click', () => calculator.clearHistory());

    // Close drawer when clicking outside
    document.addEventListener('click', (e) => {
        if (!historyPanel.contains(e.target) && !historyToggleBtn.contains(e.target)) {
            toggleHistoryDrawer(false);
        }
    });

    // 3. Theme Toggle & LocalStorage Management
    function initTheme() {
        const savedTheme = localStorage.getItem('calculator_theme');
        if (savedTheme === 'light') {
            document.body.classList.add('light-theme');
            themeIcon.textContent = '🌙';
        } else {
            document.body.classList.remove('light-theme');
            themeIcon.textContent = '☀️';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        const isLight = document.body.classList.toggle('light-theme');
        if (isLight) {
            themeIcon.textContent = '🌙';
            localStorage.setItem('calculator_theme', 'light');
        } else {
            themeIcon.textContent = '☀️';
            localStorage.setItem('calculator_theme', 'dark');
        }
    });

    initTheme();

    // 4. Keypad Button Event Listeners
    const numberButtons = document.querySelectorAll('[data-number]');
    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.appendNumber(button.getAttribute('data-number'));
            calculator.updateDisplay();
        });
    });

    const operationButtons = document.querySelectorAll('[data-operation]');
    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            calculator.chooseOperation(button.getAttribute('data-operation'));
            calculator.updateDisplay();
        });
    });

    const actionButtons = document.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
        button.addEventListener('click', () => {
            const action = button.getAttribute('data-action');
            switch (action) {
                case 'clear':
                    calculator.clear();
                    break;
                case 'delete':
                    calculator.delete();
                    break;
                case 'decimal':
                    calculator.appendNumber('.');
                    break;
                case 'paren-open':
                    calculator.appendParenthesis('(');
                    break;
                case 'paren-close':
                    calculator.appendParenthesis(')');
                    break;
                case 'toggle-sign':
                    calculator.toggleSign();
                    break;
                case 'percent':
                    calculator.percentage();
                    break;
                case 'equals':
                    calculator.compute();
                    break;
            }
            calculator.updateDisplay();
        });
    });

    // 5. Keyboard Navigation & Tactile Feedback
    function triggerButtonFeedback(button) {
        if (!button) return;
        button.classList.add('is-pressed');
        setTimeout(() => {
            button.classList.remove('is-pressed');
        }, 120);
    }

    window.addEventListener('keydown', (event) => {
        const { key } = event;

        // Prevent browser conflicts on calculator keys
        if (['/', '*', '-', '+', 'Enter', '=', 'Backspace', 'Escape', '%', '(', ')'].includes(key)) {
            event.preventDefault();
        }

        // Close history drawer on Escape
        if (key === 'Escape' && historyPanel.classList.contains('is-open')) {
            toggleHistoryDrawer(false);
            return;
        }

        // Parentheses ( and )
        if (key === '(') {
            calculator.appendParenthesis('(');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="paren-open"]'));
            return;
        }

        if (key === ')') {
            calculator.appendParenthesis(')');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="paren-close"]'));
            return;
        }

        // Digits 0-9
        if (/^[0-9]$/.test(key)) {
            calculator.appendNumber(key);
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector(`[data-number="${key}"]`));
            return;
        }

        // Decimal point
        if (key === '.' || key === ',') {
            calculator.appendNumber('.');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="decimal"]'));
            return;
        }

        // Percentage (%)
        if (key === '%') {
            calculator.percentage();
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="percent"]'));
            return;
        }

        // Operators
        if (key === '+') {
            calculator.chooseOperation('+');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-operation="+"]'));
            return;
        }

        if (key === '-') {
            calculator.chooseOperation('-');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-operation="-"]'));
            return;
        }

        if (key === '*' || key.toLowerCase() === 'x') {
            calculator.chooseOperation('×');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-operation="×"]'));
            return;
        }

        if (key === '/') {
            calculator.chooseOperation('÷');
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-operation="÷"]'));
            return;
        }

        // Equals (Enter or =)
        if (key === 'Enter' || key === '=') {
            calculator.compute();
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="equals"]'));
            return;
        }

        // Delete (Backspace)
        if (key === 'Backspace') {
            calculator.delete();
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="delete"]'));
            return;
        }

        // Clear (Escape or Delete)
        if (key === 'Escape' || key === 'Delete') {
            calculator.clear();
            calculator.updateDisplay();
            triggerButtonFeedback(document.querySelector('[data-action="clear"]'));
            return;
        }
    });

    // Initial display render
    calculator.updateDisplay();
});
