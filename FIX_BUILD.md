# 🔧 Corrigir Erro de Build - AWS Amplify

## 🎯 **Solução Rápida (3 comandos):**

**Execute no terminal:**

```bash
# 1. Remover package-lock.json desatualizado
rm package-lock.json

# 2. Regenerar arquivo atualizado
npm install

# 3. Fazer novo commit e push
git add .
git commit -m "🔧 Corrigir package-lock.json para AWS Amplify"
git push
```

## ✅ **O que vai acontecer:**

1. ✅ **Remove** o `package-lock.json` antigo
2. ✅ **Regenera** arquivo sincronizado com `package.json`
3. ✅ **Faz push** das mudanças
4. ✅ **Amplify detecta** e refaz build automaticamente

## 🔄 **Método Alternativo (se não funcionar):**

### Opção A: Atualizar Build Settings no Amplify

**AWS Amplify Console:**

1. **App settings** → **Build settings**
2. **Edit** → **Build specification**
3. **Cole este YAML:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - rm -f package-lock.json
        - npm install
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
```

### Opção B: Usar npm install em vez de npm ci

**AWS Amplify Console:**

1. **App settings** → **Build settings**
2. **Edit**
3. **Trocar:** `npm ci` por `npm install`

## 🎉 **Resultado:**

Após executar os comandos:

- ✅ **Build será executado** sem erros
- ✅ **Sistema ficará online** em ~5 minutos
- ✅ **URL será gerada** automaticamente

## 🚀 **Próximo Passo:**

**Execute os 3 comandos acima e aguarde!**

O Amplify vai detectar automaticamente o novo commit e tentar o build novamente.

**⏱️ Em 5 minutos seu sistema estará online! 🌍**
