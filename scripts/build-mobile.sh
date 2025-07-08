#!/bin/bash

echo "🚀 Iniciando build do app móvel..."

# Definir variável de ambiente para modo mobile
export VITE_APP_MODE="mobile"

# Build da aplicação web
npm run build

# Sync com plataformas nativas
npx cap sync

echo "✅ Build concluído! Use os comandos abaixo para testar:"
echo "📱 iOS: npx cap open ios"
echo "🤖 Android: npx cap open android"
