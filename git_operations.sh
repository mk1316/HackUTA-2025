#!/bin/bash
# Git operations script for organized NLP project

echo "🚀 Starting Git Operations for Organized NLP Project"
echo "=================================================="

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed or not in PATH"
    echo "Please install git first: https://git-scm.com/downloads"
    exit 1
fi

# Initialize git repository if not already initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Add all files to staging
echo "📝 Adding files to staging area..."
git add .

# Check status
echo "📊 Git status:"
git status

# Create commit with descriptive message
echo "💾 Creating commit..."
git commit -m "Organized NLP project, cleaned folder, integrated FastAPI and multi-PDF support

- Cleaned repository structure and removed duplicate files
- Organized all AI/ML modules in ai_ml/ directory
- Integrated FastAPI with multi-PDF processing
- Added AI optimization with Gemini integration
- Implemented study scheduling and time estimation
- Added comprehensive documentation and testing
- Ready for hackathon demonstration"

echo "✅ Commit created successfully"

# Create and switch to new branch
echo "🌿 Creating and switching to ai_ml_cleaned branch..."
git checkout -b ai_ml_cleaned

echo "✅ Branch 'ai_ml_cleaned' created and checked out"

# Show final status
echo "📊 Final repository status:"
git status

echo ""
echo "🎉 Git operations completed successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Add remote repository: git remote add origin <repository-url>"
echo "2. Push branch: git push origin ai_ml_cleaned"
echo "3. Create pull request on GitHub"
echo ""
echo "📁 Repository structure:"
echo "HACKUTA/NLP/"
echo "├── README.md"
echo "├── .gitignore"
echo "├── CLEANUP_LOG.md"
echo "├── COMMIT_MESSAGE.md"
echo "└── ai_ml/"
echo "    ├── main.py (FastAPI app)"
echo "    ├── text_extraction.py"
echo "    ├── study_estimator.py"
echo "    ├── gemini_teacher.py"
echo "    ├── requirements.txt"
echo "    ├── README.md"
echo "    ├── helpers/"
echo "    ├── sample_syllabi/"
echo "    ├── test_functionality.py"
echo "    └── TEST_REPORT.md"
