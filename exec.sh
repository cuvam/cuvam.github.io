#!/bin/bash

# Try `curl cuvam.github.io/exec.sh | bash` to see why it's bad to just directly pipe curl output to bash.

case "$(uname -s)" in
    Linux*)
        if grep -qi microsoft /proc/version 2>/dev/null; then
            cmd.exe /c calc.exe &
        elif command -v gnome-calculator &>/dev/null; then
            gnome-calculator &
        elif command -v kcalc &>/dev/null; then
            kcalc &
        elif command -v xcalc &>/dev/null; then
            xcalc &
        else
            echo "No calculator found"
            exit 1
        fi
        ;;
    Darwin*)
        open -a Calculator
        ;;
    MINGW*|MSYS*|CYGWIN*)
        cmd.exe //c calc.exe
        ;;
    *)
        echo "Unknown OS: $(uname -s)"
        exit 1
        ;;
esac
