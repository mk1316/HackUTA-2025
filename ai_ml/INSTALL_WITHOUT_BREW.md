# 🔧 Installation Guide Without Homebrew

## ❌ **Issue Identified:**
- `zsh: command not found: brew` - Homebrew not installed

## ✅ **Solution: Install Dependencies Without Homebrew**

### 🐍 **Step 1: Install Python Dependencies**
```bash
# Navigate to AI/ML directory
cd /Users/arnissama/Desktop/HACKUTA/NLP/ai_ml

# Install Python packages
pip3 install -r requirements.txt
```

### 🔍 **Step 2: Install Tesseract OCR (Required for PDF Processing)**

#### **Option A: Download Tesseract Installer (Recommended)**
1. Go to: https://github.com/UB-Mannheim/tesseract/wiki
2. Download the macOS installer
3. Run the installer
4. Add to PATH (if needed):
   ```bash
   export PATH="/usr/local/bin:$PATH"
   ```

#### **Option B: Install via MacPorts (if available)**
```bash
sudo port install tesseract
```

#### **Option C: Build from Source**
```bash
# Install dependencies
sudo xcode-select --install

# Download and build Tesseract
git clone https://github.com/tesseract-ocr/tesseract.git
cd tesseract
./autogen.sh
./configure
make
sudo make install
```

### 🚀 **Step 3: Run the Application**
```bash
# Set API key (optional - for AI features)
export GEMINI_API_KEY='your-api-key-here'

# Run the application
python3 main.py
```

## 🧪 **Test Installation**

### **Check Tesseract Installation:**
```bash
tesseract --version
```

### **Check Python Dependencies:**
```bash
python3 -c "import pdfplumber, pytesseract, fastapi; print('✅ All dependencies installed')"
```

## 🔧 **Alternative: Use Docker (If Available)**

If you have Docker installed:
```bash
# Create Dockerfile
cat > Dockerfile << EOF
FROM python:3.9

# Install Tesseract
RUN apt-get update && apt-get install -y tesseract-ocr

# Copy requirements and install
COPY requirements.txt .
RUN pip install -r requirements.txt

# Copy application
COPY . .

# Run application
CMD ["python", "main.py"]
EOF

# Build and run
docker build -t syllabus-parser .
docker run -p 8000:8000 syllabus-parser
```

## 🎯 **Quick Start (Minimal Setup)**

### **If you just want to test without OCR:**
```bash
# Install basic dependencies
pip3 install fastapi uvicorn python-multipart requests

# Run with limited functionality
python3 main.py
```

**Note**: PDF text extraction will work, but OCR fallback won't be available without Tesseract.

## 🌐 **Access the Application**

Once running:
- **API**: http://localhost:8000
- **Health Check**: http://localhost:8000/health
- **API Docs**: http://localhost:8000/docs

## 🧪 **Test Commands**

```bash
# Test health
curl http://localhost:8000/health

# Test sample parse
curl -X POST http://localhost:8000/test/parse-sample

# View sample courses
curl http://localhost:8000/courses/sample
```

## 🎉 **Expected Success**

When everything is working:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## 🔧 **Troubleshooting**

### **If Tesseract is still not found:**
```bash
# Find Tesseract installation
find /usr -name "tesseract" 2>/dev/null
find /opt -name "tesseract" 2>/dev/null

# Add to PATH if found elsewhere
export PATH="/path/to/tesseract:$PATH"
```

### **If Python dependencies fail:**
```bash
# Install individually
pip3 install pdfplumber pdf2image pytesseract Pillow fastapi uvicorn python-multipart requests google-generativeai
```

**The application will work with basic PDF processing even without Tesseract OCR!** 🚀
