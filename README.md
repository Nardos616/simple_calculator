# Modern Vanilla JavaScript Calculator

A clean, modern, and fully featured calculator application built using **semantic HTML5**, **modern CSS3 (CSS Grid, Flexbox, & CSS Variables)**, and **pure Vanilla JavaScript**. 

This application was engineered from scratch without external frameworks (no React, Vue, Angular, Bootstrap, or jQuery) and strictly avoids unsafe evaluation functions like `eval()` or `new Function()`.

---

## 📸 Overview & Design Highlights

- **Symmetrical 5×4 Keypad**: Clean layout where every button is evenly proportioned and comfortably sized.
- **Light & Dark Theme Switcher**: Toggle between a sleek slate dark mode and a crisp clean light mode. Remembers your choice using browser `localStorage`.
- **Slide-Down Calculation History**: Review your previous calculations, clear history, or click any past result to instantly restore it into the calculator.
- **Dual-Line Display**: Shows the active calculation history (previous operand and operator) above the current input.
- **Accessible & Tactile**: Smooth hover and active press animations for both mouse clicks and keyboard typing, with complete screen-reader ARIA annotations.

---

## 🚀 Features & Mathematics

1. **Full Arithmetic**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), and Division (`÷`).
2. **Chained Calculations**: Compute sequential operations smoothly (e.g. `5 + 3 × 2 = 16`).
3. **Smart Percentage (`%`)**:
   - **Relative**: When used after addition or subtraction (e.g., `200 + 10%`), it calculates `10% of 200` (`20`), resulting in `220`.
   - **Standalone**: When used on a single number (e.g., `50%`), it converts to its decimal fraction (`0.5`).
4. **Sign Toggle (`±`)**: Effortlessly switch positive and negative values without resetting input.
5. **Smart Decimal Handling**: Prevents multiple decimal points (`1.2.3` is blocked) and auto-prefixes `0.` when pressing `.` on empty input.
6. **Floating-Point Precision Normalization**: Eliminates IEEE-754 binary floating-point artifacts (e.g., `0.1 + 0.2` evaluates cleanly to `0.3`).
7. **Division by Zero Protection**: Gracefully displays `"Cannot divide by zero"` in red instead of crashing or showing `Infinity`.
8. **Operator Switching**: Change an operator mid-calculation if you accidentally clicked the wrong sign.
9. **Number Formatting**: Formats large numbers with localized thousand separators (commas) while preserving decimals.

---

## ⌨️ Complete Keyboard Shortcuts

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
| `0` – `9` | Number input | Types digits |
| `.` or `,` | Decimal point | Inserts decimal point |
| `%` | Percentage | Calculates percentage |
| `+` | Add | Selects addition |
| `-` | Subtract | Selects subtraction |
| `*` or `x` / `X` | Multiply | Selects multiplication |
| `/` | Divide | Selects division |
| `Enter` or `=` | Calculate (`=`) | Evaluates current expression |
| `Backspace` | Delete (`DEL`) | Removes last character |
| `Escape` or `Delete` | All Clear (`AC`) | Resets calculator / closes history drawer |

---

## 📁 File Structure

```text
js_project/
│
├── index.html         # Semantic HTML5 layout, header controls, history drawer, and keypad
├── css/
│   └── style.css      # CSS variables for Dark/Light themes, CSS Grid keypad, and drawer animations
├── js/
│   └── script.js      # Object-Oriented Calculator class, history tape, theme persistence, and event listeners
└── README.md          # Comprehensive documentation and instructions
```

---

## 🛠️ Architecture & JavaScript Concepts

### 1. Object-Oriented Calculator Class (`js/script.js`)
The core state is strictly managed inside the `Calculator` class:
- `currentOperand`: Active user input or result string.
- `previousOperand`: Stored previous value during a two-step operation.
- `operation`: Active operator string (`+`, `-`, `×`, `÷`).
- `history`: Array of completed calculations `{ equation, result }`.
- `overwrite`: Boolean flag indicating if typing should replace the current display (e.g., immediately after pressing `=`).

### 2. Zero `eval()` Security
Calculations are evaluated using a safe, explicit `switch` statement:
```javascript
switch (this.operation) {
    case '+': computation = prev + current; break;
    case '-': computation = prev - current; break;
    case '×': computation = prev * current; break;
    case '÷': computation = current === 0 ? 'Cannot divide by zero' : prev / current; break;
}
```

### 3. Theme Persistence via `localStorage`
The theme state is preserved across browser refreshes:
```javascript
// Check saved preference on load
const savedTheme = localStorage.getItem('calculator_theme');
if (savedTheme === 'light') document.body.classList.add('light-theme');

// Persist user selection on toggle
themeToggleBtn.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-theme');
    localStorage.setItem('calculator_theme', isLight ? 'light' : 'dark');
});
```

---

## 🏃 How to Run the Application

Because this project is built entirely with vanilla web standards, it requires **no node modules, build tools, or dev servers**:

1. Open the project folder:
   ```text
   C:\Users\user\Desktop\JS_Project\
   ```
2. Double-click [**`index.html`**](file:///c:/Users/user/Desktop/JS_Project/index.html) to open it in your browser (Google Chrome, Microsoft Edge, Firefox, Safari).
3. Test with your mouse or use your keyboard.
