# Modern Vanilla JavaScript Calculator

A clean, modern, and fully featured calculator application built using **semantic HTML5**, **modern CSS3 (CSS Grid, Flexbox, & CSS Variables)**, and **pure Vanilla JavaScript**. 

This application supports **Square Roots (`√`)**, **Power Exponentiation (`^`)**, and **Parentheses Expressions `( )`**, evaluated safely from scratch using the **Shunting-Yard Two-Stack algorithm** without using dangerous functions like `eval()` or `new Function()`.

---

## 📸 Overview & Design Highlights

- **Square Root (`√`) & Power (`^`)**: Solve advanced expressions like `√(3 ^ 2 + 4 ^ 2) = 5` and `2 ^ 8 = 256`.
- **Parentheses Expressions**: Full nested parentheses support with implicit multiplication (e.g. `2√(9) = 6` and `3(4 + 2) = 18`).
- **Symmetrical 6×4 Keypad Grid**: Balanced layout with comfortable touch targets on mobile and desktop.
- **Light & Dark Theme Switcher**: Toggle between a sleek slate dark theme and a crisp light theme with browser `localStorage` persistence.
- **Slide-Down Calculation History**: Review past calculations, clear history, or click any past result to restore it into the calculator.
- **Dual-Line Display**: Shows the active calculation history and full expression above the current result.
- **Accessible & Tactile**: Smooth hover and active press animations for mouse clicks and keyboard typing, with complete screen-reader ARIA annotations.

---

## 🚀 Features & Mathematics

1. **Square Root (`√`)**:
   - Calculates roots with automatic parenthesis wrapping: `√(16) = 4`.
   - Supports nested expressions inside root: `√(9 + 16) = 5`.
   - Graceful error handling for negative roots: `√(-4)` displays `"Invalid input"`.
2. **Power Exponentiation (`^`)**:
   - Evaluates powers with correct mathematical precedence: `2 + 3 ^ 2 = 11`.
   - Supports parenthesized bases and exponents: `(2 + 3) ^ 2 = 25`.
   - Supports negative exponents: `2 ^ -2 = 0.25`.
3. **Parentheses Support `( )`**:
   - Nest expressions arbitrarily deep: `(5 + 3) × (10 − 2) = 64`.
   - **Implicit Multiplication**: Typing `3(4 + 2)` automatically evaluates as `3 × (4 + 2) = 18`.
   - **Auto-Closing**: Forgives unclosed parentheses on calculate (e.g. `√(16` automatically evaluates to `4`).
4. **Full Arithmetic**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), and Division (`÷`).
5. **Safe Evaluation Without `eval()`**: Implements Dijkstra's Shunting-Yard two-stack parsing algorithm with operator precedence.
6. **Smart Percentage (`%`)**: Converts values into percentage fractions cleanly.
7. **Sign Toggle (`±`)**: Effortlessly switch between positive and negative numbers.
8. **Floating-Point Precision Normalization**: Eliminates IEEE-754 binary floating-point artifacts (`0.1 + 0.2 = 0.3`).
9. **Division by Zero Protection**: Gracefully informs the user with `"Cannot divide by zero"` in red instead of crashing.
10. **Localized Number Formatting**: Large numbers display with thousand separators (commas) while preserving decimals.

---

## ⌨️ Complete Keyboard Shortcuts

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
| `r` or `R` | Square Root (`√`) | Inserts `√(` function |
| `^` *(Shift + 6)* | Power / Exponent (`^`) | Selects exponentiation operator |
| `(` *(Shift + 9)* | Open Parenthesis | Inserts `(` with implicit multiplication if preceded by a number |
| `)` *(Shift + 0)* | Close Parenthesis | Inserts `)` if a matching open parenthesis exists |
| `0` – `9` | Number input | Types digits |
| `.` or `,` | Decimal point | Inserts decimal point |
| `%` | Percentage | Calculates percentage |
| `+` | Add | Selects addition |
| `-` | Subtract | Selects subtraction |
| `*` or `x` / `X` | Multiply | Selects multiplication |
| `/` | Divide | Selects division |
| `Enter` or `=` | Calculate (`=`) | Evaluates the expression |
| `Backspace` | Delete (`DEL`) | Removes last character or operator |
| `Escape` or `Delete` | All Clear (`AC`) | Resets calculator / closes history drawer |

---

## 📁 File Structure

```text
js_project/
│
├── index.html         # Semantic HTML5 layout, header controls, history drawer, and 6x4 keypad
├── css/
│   └── style.css      # CSS variables for Dark/Light themes, 6x4 CSS Grid, and responsive queries
├── js/
│   └── script.js      # Shunting-Yard two-stack evaluator, sqrt & power handlers, and event listeners
└── README.md          # Comprehensive documentation and instructions
```

---

## 🛠️ How Square Root & Power Precedence Work Under the Hood

In mathematics, order of operations (**PEMDAS/BODMAS**) requires:
1. **P**arentheses & Functions: `( )`, `√`
2. **E**xponents: `^`
3. **M**ultiplication & **D**ivision: `×`, `÷`
4. **A**ddition & **S**ubtraction: `+`, `−`

In [`js/script.js`](file:///c:/Users/user/Desktop/JS_Project/js/script.js):
```javascript
precedence(op) {
    if (op === '+' || op === '−' || op === '-') return 1;
    if (op === '×' || op === '*' || op === '÷' || op === '/' || op === '%') return 2;
    if (op === '^') return 3; // Power has higher precedence than multiplication
    return 0;
}
```

When evaluating `2 + 3 ^ 2`:
- `^` (precedence 3) is computed before `+` (precedence 1), giving `2 + 9 = 11`.

When evaluating `√(3 ^ 2 + 4 ^ 2)`:
- `3 ^ 2 = 9` and `4 ^ 2 = 16`.
- `9 + 16 = 25`.
- `√(25) = 5`.

---

## 🏃 How to Run the Application

1. Open the project folder:
   ```text
   C:\Users\user\Desktop\JS_Project\
   ```
2. Double-click [**`index.html`**](file:///c:/Users/user/Desktop/JS_Project/index.html) to open it in any web browser.
3. Try these example calculations:
   - **Square Root**: `√` $\rightarrow$ `144` $\rightarrow$ `=` $\rightarrow$ **`12`**
   - **Power**: `2` $\rightarrow$ `^` $\rightarrow$ `8` $\rightarrow$ `=` $\rightarrow$ **`256`**
   - **Pythagorean Theorem**: `√` $\rightarrow$ `3` $\rightarrow$ `^` $\rightarrow$ `2` $\rightarrow$ `+` $\rightarrow$ `4` $\rightarrow$ `^` $\rightarrow$ `2` $\rightarrow$ `)` $\rightarrow$ `=` $\rightarrow$ **`5`**
