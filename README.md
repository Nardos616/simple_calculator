# Modern Vanilla JavaScript Calculator

A clean, modern, and fully featured calculator application built using **semantic HTML5**, **modern CSS3 (CSS Grid, Flexbox, & CSS Variables)**, and **pure Vanilla JavaScript**. 

This application supports full **parentheses expressions `( )`**, evaluated safely from scratch using the **Shunting-Yard Two-Stack algorithm** without using dangerous functions like `eval()` or `new Function()`.

---

## 📸 Overview & Design Highlights

- **Parentheses Expression Keypad**: Full support for `(` and `)` with nested expressions and implicit multiplication.
- **Symmetrical 6×4 Keypad Grid**: Balanced layout with comfortable touch targets on mobile and desktop.
- **Light & Dark Theme Switcher**: Toggle between a sleek slate dark theme and a crisp light theme with browser `localStorage` persistence.
- **Slide-Down Calculation History**: Review past calculations, clear history, or click any past result to restore it into the calculator.
- **Dual-Line Display**: Shows the active calculation history and full expression above the current result.
- **Accessible & Tactile**: Smooth hover and active press animations for mouse clicks and keyboard typing, with complete screen-reader ARIA annotations.

---

## 🚀 Features & Mathematics

1. **Parentheses Support `( )`**:
   - Nest expressions arbitrarily deep: `(5 + 3) × (10 − 2) = 64`.
   - **Implicit Multiplication**: Typing `3(4 + 2)` automatically evaluates as `3 × (4 + 2) = 18`.
   - **Auto-Closing**: Forgives unclosed parentheses on calculate (e.g. `5 × (2 + 3` automatically evaluates to `25`).
2. **Full Arithmetic**: Addition (`+`), Subtraction (`−`), Multiplication (`×`), and Division (`÷`).
3. **Safe Evaluation Without `eval()`**: Implements Dijkstra's Shunting-Yard two-stack parsing algorithm with operator precedence.
4. **Smart Percentage (`%`)**: Converts values into percentage fractions cleanly.
5. **Sign Toggle (`±`)**: Effortlessly switch between positive and negative numbers.
6. **Floating-Point Precision Normalization**: Eliminates IEEE-754 binary floating-point artifacts (`0.1 + 0.2 = 0.3`).
7. **Division by Zero Protection**: Gracefully informs the user with `"Cannot divide by zero"` in red instead of crashing.
8. **Localized Number Formatting**: Large numbers display with thousand separators (commas) while preserving decimals.

---

## ⌨️ Complete Keyboard Shortcuts

| Key | Calculator Action | Description |
| :--- | :--- | :--- |
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
│   └── script.js      # Shunting-Yard two-stack evaluator, parentheses handler, theme manager, and event listeners
└── README.md          # Comprehensive documentation and instructions
```

---

## 🛠️ How Parentheses Evaluation Works Under the Hood

Unlike naive calculators that calculate each operation immediately, evaluating expressions with parentheses like:
$$2 \times (3 + 4) = 14$$
requires respecting **operator precedence** and **nesting**. 

Our implementation in [`js/script.js`](file:///c:/Users/user/Desktop/JS_Project/js/script.js) uses the **Shunting-Yard Two-Stack Algorithm**:
1. **Tokenizer**: Scans the input string into numbers, operators, and parentheses tokens.
2. **Values Stack**: Stores numerical values.
3. **Operators Stack**: Stores operators (`+`, `−`, `×`, `÷`) and `(`.
4. When `(` is encountered, it is pushed to the operator stack.
5. When `)` is encountered, operators and values are popped and calculated until the matching `(` is found.
6. When an operator is encountered, higher-precedence operators on top of the stack are resolved first.

This ensures mathematical precision without security risks or external dependencies.

---

## 🏃 How to Run the Application

1. Open the project folder:
   ```text
   C:\Users\user\Desktop\JS_Project\
   ```
2. Double-click [**`index.html`**](file:///c:/Users/user/Desktop/JS_Project/index.html) to open it in any web browser.
3. Try typing expressions with parentheses using the on-screen buttons or your keyboard:
   - Example 1: `( 5 + 3 ) × 2` -> `= 16`
   - Example 2: `2 × ( 10 − 4 ) ÷ 3` -> `= 4`
   - Example 3: `0.1 + 0.2` -> `= 0.3`
