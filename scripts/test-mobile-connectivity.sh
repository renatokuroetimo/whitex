#!/bin/bash

echo "🧪 Testando conectividade do app móvel com Supabase..."

# Definir variáveis de ambiente para modo mobile
export VITE_APP_MODE="mobile"
export VITE_SUPABASE_URL="https://ogyvioeeaknagslworyz.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXZpb2VlYWtuYWdzbHdvcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg0MTMsImV4cCI6MjA2NTgyNDQxM30.tvWZHrK-OwIPjHgjAq8PA1Wr95OFmfPi89X6gmDB5Lw"

echo "🔧 Configuração:"
echo "- Modo: $VITE_APP_MODE"
echo "- URL: $VITE_SUPABASE_URL"
echo "- Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# Teste de conectividade usando curl
echo ""
echo "🌐 Testando conectividade de rede com Supabase..."
curl -I -s --connect-timeout 10 "$VITE_SUPABASE_URL" | head -1

# Build mobile rápido para teste
echo ""
echo "🔨 Fazendo build mobile para teste..."
npm run mobile:build > /dev/null 2>&1

if [ $? -eq 0 ]; then
    echo "✅ Build mobile concluído com sucesso"
    echo ""
    echo "🚀 Para testar no iOS:"
    echo "   npm run mobile:ios"
    echo ""
    echo "🤖 Para testar no Android:"
    echo "   npm run mobile:android"
else
    echo "❌ Erro no build mobile"
    exit 1
fi
