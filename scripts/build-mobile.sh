#!/bin/bash

echo "🚀 Iniciando build do app móvel..."

# Definir variáveis de ambiente para modo mobile
export VITE_APP_MODE="mobile"

# Usar variáveis de produção do Supabase
export VITE_SUPABASE_URL="https://ogyvioeeaknagslworyz.supabase.co"
export VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neXZpb2VlYWtuYWdzbHdvcnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAyNDg0MTMsImV4cCI6MjA2NTgyNDQxM30.tvWZHrK-OwIPjHgjAq8PA1Wr95OFmfPi89X6gmDB5Lw"

echo "🔧 Configuração do Supabase:"
echo "- URL: $VITE_SUPABASE_URL"
echo "- Key: ${VITE_SUPABASE_ANON_KEY:0:20}..."

# Build da aplicação web com configuração específica para mobile
vite build --config vite.config.mobile.ts

# Copiar index.html mobile para Capacitor
cp dist/index-mobile.html dist/index.html

# Sync com plataformas nativas
npx cap sync

echo "✅ Build concluído! Use os comandos abaixo para testar:"
echo "📱 iOS: npx cap open ios"
echo "🤖 Android: npx cap open android"
