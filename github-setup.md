# 📂 Setup do Repositório GitHub

## Passos para conectar ao GitHub:

### 1. Criar repositório no GitHub

1. Acesse: https://github.com/new
2. Nome: `medical-auth-system` (ou nome de sua escolha)
3. Descrição: `Sistema completo de autenticação médica`
4. ✅ Public (recomendado para Amplify gratuito)
5. ❌ NÃO inicializar com README (já temos)
6. Clique "Create repository"

### 2. Conectar repositório local

```bash
# Adicionar origem remota (substitua SEU-USUARIO)
git remote add origin https://github.com/SEU-USUARIO/medical-auth-system.git

# Verificar se foi adicionado
git remote -v

# Fazer primeiro commit e push
git add .
git commit -m "🚀 Sistema médico completo - pronto para deploy"
git branch -M main
git push -u origin main
```

### 3. Verificar upload

- Acesse seu repositório no GitHub
- Verifique se todos os arquivos estão lá
- Confirme que o `amplify.yml` está presente

## ✅ Próximo passo: AWS Amplify Console
