# Simple C Compiler

A lightweight VS Code extension that makes learning C and C++ easier by compiling and running your code with a single click – no need to type compiler commands in the terminal every time!

## Who Is This For?

This extension is designed for **beginners learning C or C++** who:
- Are just starting with C/C++ programming
- Understand how compilers work
- Want to focus on writing code without worrying about terminal commands
- Get tired of typing `gcc program.c -o program` and `./program` repeatedly

Perfect for students, coding learners, and anyone taking their first steps in systems programming!

## Features

### One-Click Compilation & Execution
- Click the **Play Button (▶)** in the editor toolbar (top right, next to "Open Changes")
- Your C/C++ file is instantly compiled and executed
- Works for programs that need user input (fully interactive!)

### Automatic Compiler Detection
- Detects available compilers on your system:
  - **macOS/Linux:** GCC, Clang, G++, Clang++
  - **Windows:** MSVC, GCC, Clang
- Automatically selects the first available compiler on startup
- All compilers are automatically detected – no manual configuration needed!

### Easy Compiler Selection
- Switch between compilers anytime using the Command Palette
- Your choice is saved in your workspace

### Clear Output & Error Messages
- Compilation errors are shown in a dedicated output panel
- Program output appears directly in the terminal
- Clean terminal view (auto-clears before each run)

### Cross-Platform Support
- Works on **Windows**, **macOS**, and **Linux**
- Platform-specific compiler detection and settings

## Installation

1. Open **VS Code** or **Codium**
2. Go to **Extensions** (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for **"Simple C Compiler"**
4. Click **Install**

That's it! The extension is ready to use.


## ⚙️ Configuration

### Automatic Setup
On first use, the extension automatically:
1. Detects available compilers on your system
2. Selects the first one found
3. Gets ready to compile!

### How to Change Your Compiler Manually

#### Method 1: Command Palette (Recommended & Easiest)

This is the **easiest way for beginners**:

1. **Open the Command Palette:**
   - Press **`Ctrl+Shift+P`** (Windows/Linux)
   - Press **`Cmd+Shift+P`** (macOS)

2. **Type:** `Select C/C++ Compiler`

3. **Choose your compiler** from the list:
   - `GCC` – Classic and widely used
   - `Clang` – Fast and modern
   - `G++` – For C++ programs
   - `Clang++` – Clang for C++
   - `MSVC` – Windows (Visual Studio compiler)

4. **Done!** Your choice is saved and will be used for all future compilations


#### Method 2: Manual Settings (For Advanced Users)

You can also edit your workspace settings directly:

1. **Create/Edit `.vscode/settings.json`** in your project folder
2. **Add this line:**
   ```json
   {
     "simpleCCompiler.compiler": "GCC"
   }
   ```

3. **Available values:**
   - `"GCC"` – GCC compiler
   - `"Clang"` – Clang compiler
   - `"Clang++"` – Clang for C++
   - `"G++"` – G++ for C++
   - `"MSVC"` – MSVC for Windows

4. **Save and restart VS Code**


## Requirements

You need at least one C/C++ compiler installed:

### macOS
```bash
# Install GCC/Clang via Homebrew
brew install gcc
# or (Clang comes with Xcode)
xcode-select --install
```

### Linux (Ubuntu/Debian)
```bash
sudo apt-get install build-essential
```

### Windows
- Download and install one of:
  - [MinGW-w64](https://www.mingw-w64.org/) (GCC for Windows)
  - [MSVC](https://visualstudio.microsoft.com/downloads/) (Visual Studio Build Tools)
  - [Clang](https://releases.llvm.org/download.html)

## 💡 Tips for Beginners

1. **Save your file before running** – The extension compiles the saved version
2. **Read the output panel** – Compilation errors are shown clearly there
3. **Terminal shows execution output** – If your program produces output, look in the terminal
4. **Use simple file names** – Avoid spaces and special characters in filenames
5. **Check your code first** – The extension only compiles valid C/C++ code
6. **Not sure which compiler to use?** – GCC is a safe bet for beginners!

## Known Issues

- **Programs stuck?** – If your program waits for input and nothing happens, click in the terminal and type your input
- **Compiler not found?** – Make sure you have a C/C++ compiler installed (see Requirements)

## Contributing

Found a bug? Have a feature idea? Visit the [GitHub repository](https://github.com/yourusername/simple-c-compiler) and open an issue!

## License

This extension is open source and available under the MIT License.
