/**
 * Modern Vanilla JavaScript Calculator
 * 
 * Features:
 * 1. Object-Oriented Calculator class separating business logic from DOM presentation.
 * 2. Pure arithmetic computation without using eval() or new Function().
 * 3. Support for standard arithmetic (+, -, ×, ÷), percentage (%), and sign toggle (±).
 * 4. Graceful handling of division by zero and floating-point imprecision.
 * 5. Calculation History Drawer with persistent memory and one-click value restoration.
 * 6. Light / Dark Theme Switcher with localStorage persistence.
 * 7. Full keyboard event listeners with visual button press feedback.
 */

class Calculator {
    /**
     * @param {HTMLElement} previousOperandElement - DOM element displaying previous operand & operator
     * @param {HTMLElement} currentOperandElement - DOM element displaying active input or result
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
     * Resets the calculator state to default values.
     */
    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.isError = false;
        this.overwrite = false;
    }

    /**
     * Deletes the most recent character from current operand.
     */
    delete() {
        if (this.isError) {
            this.clear();
            return;
        }

        if (this.overwrite) {
            this.currentOperand = '0';
            this.overwrite = false;
            return;
        }

        if (this.currentOperand === '0') return;

        // If single character or negative single digit (e.g. "-5"), reset to '0'
        if (this.currentOperand.length <= 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.slice(0, -1);
        }
    }

    /**
     * Appends a digit or decimal point to the current operand.
     * @param {string} number - The digit (0-9) or decimal point (.)
     */
    appendNumber(number) {
        if (this.isError) {
            this.clear();
        }

        // If typing a new number immediately following an '=' evaluation
        if (this.overwrite) {
            this.currentOperand = number === '.' ? '0.' : number.toString();
            this.overwrite = false;
            return;
        }

        // Prevent multiple decimal points
        if (number === '.' && this.currentOperand.includes('.')) return;

        // If current input is empty and decimal is pressed, prepend '0.'
        if (this.currentOperand === '' && number === '.') {
            this.currentOperand = '0.';
            return;
        }

        // Prevent leading zeroes duplication (e.g., "000")
        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
            return;
        }

        this.currentOperand = this.currentOperand.toString() + number.toString();
    }

    /**
     * Toggles the sign (positive/negative) of the current operand.
     */
    toggleSign() {
        if (this.isError || this.currentOperand === '0' || this.currentOperand === '') return;

        if (this.currentOperand.startsWith('-')) {
            this.currentOperand = this.currentOperand.slice(1);
        } else {
            this.currentOperand = '-' + this.currentOperand;
        }
    }

    /**
     * Computes percentage based on current and previous operands.
     */
    percentage() {
        if (this.isError || this.currentOperand === '' || isNaN(parseFloat(this.currentOperand))) return;

        let result;
        const current = parseFloat(this.currentOperand);

        // Relative percentage if preceding operation is addition or subtraction (e.g., 200 + 10% = 200 + 20)
        if (this.previousOperand !== '' && (this.operation === '+' || this.operation === '-' || this.operation === '−')) {
            const prev = parseFloat(this.previousOperand);
            result = (prev * current) / 100;
        } else {
            // Absolute percentage (e.g., 50% = 0.5)
            result = current / 100;
        }

        this.currentOperand = this.roundAccurate(result).toString();
    }

    /**
     * Chooses an arithmetic operator (+, −, ×, ÷).
     * @param {string} operation - The chosen mathematical operator
     */
    chooseOperation(operation) {
        if (this.isError) {
            this.clear();
        }

        // If operator was chosen but user hasn't typed next number, allow switching operator
        if (this.currentOperand === '' && this.previousOperand !== '') {
            this.operation = operation;
            return;
        }

        // Perform intermediate chained calculation
        if (this.previousOperand !== '') {
            this.compute();
            if (this.isError) return;
        }

        this.operation = operation;
        this.previousOperand = this.currentOperand;
        this.currentOperand = '';
        this.overwrite = false;
    }

    /**
     * Evaluates the arithmetic expression between previous and current operands.
     */
    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        // Do nothing if either operand is missing or invalid
        if (isNaN(prev) || isNaN(current) || this.operation == null) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
            case '−':
                computation = prev - current;
                break;
            case '×':
            case '*':
                computation = prev * current;
                break;
            case '÷':
            case '/':
                if (current === 0) {
                    this.isError = true;
                    this.currentOperand = 'Cannot divide by zero';
                    this.previousOperand = '';
                    this.operation = undefined;
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Eliminate IEEE-754 binary floating-point rounding quirks
        computation = this.roundAccurate(computation);

        // Record successful calculation to history
        const equationText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation} ${this.getDisplayNumber(this.currentOperand)}`;
        this.recordHistory(equationText, computation.toString());

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.overwrite = true;
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
     * Formats numbers with thousand separators while preserving decimals.
     * @param {string|number} number - The number to format for display
     * @returns {string} Formatted number string
     */
    getDisplayNumber(number) {
        if (this.isError) return number;

        const stringNumber = number.toString();
        const parts = stringNumber.split('.');
        const integerDigits = parseFloat(parts[0]);
        const decimalDigits = parts[1];

        let integerDisplay;
        if (parts[0] === '-0') {
            integerDisplay = '-0';
        } else if (isNaN(integerDigits)) {
            integerDisplay = parts[0] === '-' ? '-' : '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', {
                maximumFractionDigits: 0
            });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        }
        return integerDisplay;
    }

    /**
     * Records a completed calculation into the history tape.
     * @param {string} equation - Equation string (e.g. "12 × 5")
     * @param {string} result - Calculated result (e.g. "60")
     */
    recordHistory(equation, result) {
        this.history.unshift({ equation, result });
        if (this.history.length > 25) {
            this.history.pop(); // Keep last 25 calculations
        }
        if (typeof this.onHistoryUpdate === 'function') {
            this.onHistoryUpdate(this.history);
        }
    }

    /**
     * Restores a previously calculated value from history into the active display.
     * @param {string} result - Value to load
     */
    restoreValue(result) {
        this.clear();
        this.currentOperand = result;
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
     * Updates the DOM elements to mirror current state.
     */
    updateDisplay() {
        if (this.isError) {
            this.currentOperandElement.innerText = this.currentOperand;
            this.currentOperandElement.classList.add('error-state');
            this.previousOperandElement.innerText = '';
            return;
        }

        this.currentOperandElement.classList.remove('error-state');

        if (this.currentOperand === '') {
            this.currentOperandElement.innerText = '0';
        } else {
            this.currentOperandElement.innerText = this.getDisplayNumber(this.currentOperand);
        }

        if (this.operation != null) {
            this.previousOperandElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${this.operation}`;
        } else {
            this.previousOperandElement.innerText = '';
        }
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
                <span class="history-result">${calculator.getDisplayNumber(item.result)}</span>
            `;

            // Clicking a history entry loads its result into the calculator
            li.addEventListener('click', () => {
                calculator.restoreValue(item.result);
                toggleHistoryDrawer(false);
            });

            // Keyboard accessibility (Enter/Space on history item)
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

        // Prevent browser conflict on calculator keys
        if (['/', '*', '-', '+', 'Enter', '=', 'Backspace', 'Escape', '%'].includes(key)) {
            event.preventDefault();
        }

        // Close history drawer on Escape
        if (key === 'Escape' && historyPanel.classList.contains('is-open')) {
            toggleHistoryDrawer(false);
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
