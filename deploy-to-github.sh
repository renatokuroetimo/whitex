#!/bin/bash

echo "🚀 Deploy Automático para GitHub + AWS Amplify"
echo "=============================================="

# Verificar se está na pasta correta
if [ ! -f "package.json" ]; then
    echo "❌ Erro: Execute este script na pasta raiz do projeto (onde está o package.json)"
    exit 1
fi

echo "✅ Pasta do projeto encontrada!"

# Verificar se Git está configurado
if ! git config user.name > /dev/null; then
    echo "📝 Configurando Git..."
    read -p "Seu nome: " git_name
    read -p "Seu email: " git_email
    git config --global user.name "$git_name"
    git config --global user.email "$git_email"
    echo "✅ Git configurado!"
fi

# Verificar se é um repositório Git
if [ ! -d ".git" ]; then
    echo "📁 Inicializando repositório Git..."
    git init
    echo "✅ Git inicializado!"
fi

# Pedir informações do repositório GitHub
echo ""
echo "📂 Configuração do Repositório GitHub"
echo "-----------------------------------"
read -p "Seu username do GitHub: " github_user
read -p "Nome do repositório (ex: medical-auth-system): " repo_name

# URL do repositório
repo_url="https://github.com/$github_user/$repo_name.git"

echo ""
echo "🔗 Repositório: $repo_url"
echo ""

# Remover origin se existir
if git remote get-url origin > /dev/null 2>&1; then
    echo "🔄 Removendo origin existente..."
    git remote remove origin
fi

# Adicionar novo origin
echo "🔗 Adicionando origin..."
git remote add origin "$repo_url"

# Verificar se há mudanças
echo "📦 Preparando arquivos..."
git add .

# Verificar se há algo para commit
if git diff --staged --quiet; then
    echo "ℹ️  Nenhuma mudança detectada, usando commit existente"
else
    echo "💾 Fazendo commit..."
    git commit -m "🚀 Sistema médico completo - deploy inicial

- ✅ Sistema de autenticação completo
- ✅ Registro médicos e pacientes  
- ✅ Validação CRM
- ✅ Dashboard protegido
- ✅ Design responsivo
- ✅ Configurado para AWS Amplify"
fi

# Configurar branch main
echo "🌳 Configurando branch main..."
git branch -M main

# Push para GitHub
echo "📤 Enviando para GitHub..."
if git push -u origin main; then
    echo ""
    echo "🎉 SUCESSO! Projeto enviado para GitHub!"
    echo ""
    echo "🔗 Repositório: https://github.com/$github_user/$repo_name"
    echo ""
    echo "📋 PRÓXIMOS PASSOS:"
    echo "1. ✅ Repositório criado e código enviado"
    echo "2. 🌐 Acesse: https://console.aws.amazon.com/amplify/"
    echo "3. 🔽 Clique 'New app' → 'Host web app'"
    echo "4. 📂 GitHub → Selecione '$repo_name'"
    echo "5. 🌿 Branch: main"
    echo "6. 🚀 Save and deploy"
    echo ""
    echo "⏱️  Deploy será concluído em ~10 minutos"
    echo "🌍 URL será algo como: https://main.d123456.amplifyapp.com"
    echo ""
else
    echo ""
    echo "❌ Erro no push para GitHub"
    echo ""
    echo "📋 SOLUÇÕES:"
    echo "1. 📂 Crie o repositório no GitHub primeiro:"
    echo "   https://github.com/new"
    echo "   Nome: $repo_name"
    echo "   ✅ Public"
    echo "   ❌ Não adicione README"
    echo ""
    echo "2. 🔑 Se pedir senha, use Personal Access Token:"
    echo "   GitHub → Settings → Developer settings → Personal access tokens"
    echo ""
    echo "3. 🔄 Execute o script novamente"
fi
