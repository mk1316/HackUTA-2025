#!/bin/bash
echo "🔍 SyllabusSync Integration Status Check"
echo "=========================================="
echo ""

echo "📁 Project Structure:"
echo "  AI/ML Service:    $([ -f ai_ml/api.py ] && echo '✅' || echo '❌') api.py"
echo "  Backend Service:  $([ -f backend/main.py ] && echo '✅' || echo '❌') main.py"
echo "  Frontend App:     $([ -f frontend/app/page.tsx ] && echo '✅' || echo '❌') page.tsx"
echo ""

echo "📦 Dependencies:"
echo "  AI/ML:    $([ -f ai_ml/requirements.txt ] && echo '✅' || echo '❌') requirements.txt"
echo "  Backend:  $([ -f backend/requirements.txt ] && echo '✅' || echo '❌') requirements.txt"
echo "  Frontend: $([ -f frontend/package.json ] && echo '✅' || echo '❌') package.json"
echo ""

echo "⚙️  Configuration:"
echo "  AI/ML .env:       $([ -f ai_ml/.env ] && echo '✅ Found' || echo '⚠️  Missing (copy from .env.example)')"
echo "  Backend .env:     $([ -f backend/.env ] && echo '✅ Found' || echo '⚠️  Missing (copy from .env.example)')"
echo "  Frontend .env:    $([ -f frontend/.env.local ] && echo '✅ Found' || echo '⚠️  Missing')"
echo ""

echo "🌐 Service Status:"
curl -s http://localhost:5050/health > /dev/null 2>&1 && echo "  AI/ML (5050):     ✅ Running" || echo "  AI/ML (5050):     ❌ Not running"
curl -s http://localhost:8000/health > /dev/null 2>&1 && echo "  Backend (8000):   ✅ Running" || echo "  Backend (8000):   ❌ Not running"
curl -s http://localhost:3000 > /dev/null 2>&1 && echo "  Frontend (3000):  ✅ Running" || echo "  Frontend (3000):  ❌ Not running"
echo ""

echo "📚 Documentation:"
echo "  Integration Guide:  $([ -f INTEGRATION_GUIDE.md ] && echo '✅' || echo '❌')"
echo "  Start Services:     $([ -f START_SERVICES.md ] && echo '✅' || echo '❌')"
echo "  Architecture:       $([ -f ARCHITECTURE.md ] && echo '✅' || echo '❌')"
echo ""

echo "=========================================="
echo "💡 To start services, see START_SERVICES.md"
