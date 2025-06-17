#!/bin/bash

# 🚀 Script de Deploy - Sistema Médico
# Execute: chmod +x scripts/deploy.sh && ./scripts/deploy.sh

set -e

echo "🏥 Deploy do Sistema Médico"
echo "=========================="

# Verificar se estamos na branch main
BRANCH=$(git branch --show-current)
if [ "$BRANCH" != "main" ]; then
    echo "❌ Erro: Execute o deploy apenas na branch main"
    echo "   Branch atual: $BRANCH"
    exit 1
fi

# Verificar se há mudanças não commitadas
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Erro: Há mudanças não commitadas"
    echo "   Execute: git add . && git commit -m 'mensagem'"
    exit 1
fi

echo "✅ Verificações iniciais OK"

# Build do projeto
echo "📦 Fazendo build do projeto..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build concluído com sucesso"
else
    echo "❌ Erro no build"
    exit 1
fi

# Verificar tamanho do bundle
echo "📊 Tamanho do bundle:"
du -sh dist/

# Opções de deploy
echo ""
echo "🚀 Escolha o método de deploy:"
echo "1) AWS Amplify (Git-based)"
echo "2) AWS S3 + CloudFront"
echo "3) Apenas build (manual)"

read -p "Escolha (1-3): " choice

case $choice in
    1)
        echo "🔗 Deploy via AWS Amplify"
        echo "1. Acesse: https://console.aws.amazon.com/amplify/"
        echo "2. Clique em 'New app' → 'Host web app'"
        echo "3. Conecte este repositório"
        echo "4. Branch: main"
        echo "5. Build settings será detectado automaticamente"
        echo ""
        echo "📋 Build command: npm run build"
        echo "📋 Output directory: dist"
        echo ""
        echo "🔄 Push para main para fazer deploy automático:"
        echo "   git push origin main"
        ;;
    2)
        echo "☁️ Deploy manual para S3"
        echo ""
        if command -v aws &> /dev/null; then
            read -p "Bucket S3 name: " bucket_name
            read -p "CloudFront Distribution ID (opcional): " distribution_id
            
            if [ -n "$bucket_name" ]; then
                echo "📤 Uploading para S3..."
                aws s3 sync dist/ s3://$bucket_name --delete
                
                if [ -n "$distribution_id" ]; then
                    echo "🔄 Invalidando CloudFront..."
                    aws cloudfront create-invalidation --distribution-id $distribution_id --paths "/*"
                fi
                
                echo "✅ Deploy concluído!"
                echo "🌍 Site disponível em: https://$bucket_name.s3-website.amazonaws.com"
            else
                echo "❌ Nome do bucket é obrigatório"
            fi
        else
            echo "❌ AWS CLI não encontrado"
            echo "📥 Instale: https://aws.amazon.com/cli/"
            echo ""
            echo "📋 Comandos manuais:"
            echo "   aws s3 sync dist/ s3://SEU-BUCKET --delete"
            echo "   aws cloudfront create-invalidation --distribution-id ID --paths '/*'"
        fi
        ;;
    3)
        echo "✅ Build concluído!"
        echo "📁 Arquivos em: ./dist/"
        echo ""
        echo "📋 Para deploy manual:"
        echo "   - Faça upload da pasta 'dist' para seu servidor"
        echo "   - Configure redirecionamento SPA (/* → /index.html)"
        echo "   - Configure HTTPS e headers de segurança"
        ;;
    *)
        echo "❌ Opção inválida"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy process finalizado!"
echo "📚 Documentação completa: ./deploy.md"
