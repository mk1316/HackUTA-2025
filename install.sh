#!/bin/bash

echo "Installing Syllabus Text Extraction Dependencies..."
echo "=================================================="

# Install Python packages
echo "Installing Python packages..."
pip install -r requirements.txt

# Check system for tesseract
echo ""
echo "Checking for tesseract installation..."

if command -v tesseract &> /dev/null; then
    echo "✅ tesseract is already installed"
    tesseract --version
else
    echo "❌ tesseract not found"
    echo ""
    echo "Please install tesseract for your system:"
    echo ""
    echo "macOS:"
    echo "  brew install tesseract"
    echo ""
    echo "Ubuntu/Debian:"
    echo "  sudo apt-get install tesseract-ocr"
    echo ""
    echo "Windows:"
    echo "  Download from: https://github.com/UB-Mannheim/tesseract/wiki"
    echo ""
fi

echo ""
echo "Setup complete! You can now run:"
echo "  python main.py"
