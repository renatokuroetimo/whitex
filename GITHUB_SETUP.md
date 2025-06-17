# 🚀 Envio Automático para GitHub

## 📍 Localização do Projeto

Seu projeto está na pasta: `/code/`

## 🎯 Comando Único para Enviar

**Cole estes comandos no terminal, um por vez:**

### 1️⃣ Primeiro, crie o repositório no GitHub:

👉 **Acesse:** https://github.com/new

- **Nome:** `medical-auth-system`
- **Tipo:** ✅ Public
- **❌ NÃO** marque nenhuma opção extra
- **Clique:** "Create repository"

### 2️⃣ No terminal, execute estes comandos:

```bash
# Configurar Git (apenas primeira vez)
git config --global user.name "Seu Nome"
git config --global user.email "seuemail@exemplo.com"

# Navegar para a pasta do projeto
cd /code

# Verificar se está na pasta correta
ls package.json

# Adicionar origin (SUBSTITUA SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/medical-auth-system.git

# Adicionar todos os arquivos
git add .

# Commit
git commit -m "🚀 Sistema médico completo - deploy inicial"

# Configurar branch
git branch -M main

# Enviar para GitHub
git push -u origin main
```

## 🆘 Se der erro:

### **"fatal: not a git repository"**

```bash
cd /code
git init
git add .
git commit -m "Initial commit"
# Depois continue com os comandos acima
```

### **"remote origin already exists"**

```bash
git remote remove origin
git remote add origin https://github.com/SEU-USUARIO/medical-auth-system.git
git push -u origin main
```

### **Pede senha/token**

1. **GitHub** → **Settings** → **Developer settings**
2. **Personal access tokens** → **Generate new token**
3. **Scopes:** ✅ repo
4. **Use o token como senha**

## ✅ Verificação

Após executar:

1. **Recarregue** seu repositório no GitHub
2. **Deve aparecer:** todos os arquivos
3. **Confirme:** `package.json`, `src/`, `amplify.yml`

## 🌐 Próximo Passo: AWS Amplify

Com o código no GitHub:

1. **AWS Amplify:** https://console.aws.amazon.com/amplify/
2. **New app** → **Host web app**
3. **GitHub** → **Continue**
4. **Repositório:** `medical-auth-system`
5. **Branch:** `main`
6. **Save and deploy** 🚀

**⏱️ Em 10 minutos seu sistema estará online!**

---

## 🎯 Resumo do que vai acontecer:

1. ✅ **Código vai para GitHub** (comandos acima)
2. ✅ **Amplify detecta automaticamente**
3. ✅ **Build e deploy automático**
4. ✅ **URL gerada:** `https://main.d123456.amplifyapp.com`
5. ✅ **SSL/HTTPS automático**
6. ✅ **Deploy a cada push** (futuro)

**Precisa de ajuda com algum comando específico?** 🤔
