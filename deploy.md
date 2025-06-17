# 🚀 Guia de Deploy - Aplicação Médica

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta AWS ativa
- AWS CLI configurado (opcional)

## 🗂️ Configuração do Repositório

### 1. Conectar ao GitHub/GitLab

```bash
# Se ainda não tem um repositório remoto
git remote add origin https://github.com/seu-usuario/medical-app.git

# Primeiro commit
git add .
git commit -m "feat: sistema completo de autenticação médica"
git push -u origin main
```

### 2. Estrutura do Projeto

```
medical-app/
├── src/                    # Código fonte
├── public/                 # Arquivos públicos
├── dist/                   # Build de produção
├── .env.example           # Variáveis de ambiente
├── buildspec.yml          # AWS CodeBuild
└── deploy.md              # Este guia
```

## ☁️ Opções de Deploy AWS

### Opção 1: AWS Amplify (Recomendado - Mais Simples)

**Vantagens:**

- Deploy automático via Git
- SSL/HTTPS automático
- CDN global incluído
- Rollbacks fáceis

**Passos:**

1. Acesse [AWS Amplify Console](https://console.aws.amazon.com/amplify/)
2. "New app" → "Host web app"
3. Conecte seu repositório GitHub/GitLab
4. Configure build settings (veja abaixo)
5. Deploy!

**Build Settings para Amplify:**

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### Opção 2: AWS S3 + CloudFront (Mais Controle)

**Vantagens:**

- Menor custo
- Máximo controle
- Performance excelente

**Passos:**

1. Criar bucket S3
2. Configurar hosting estático
3. Criar distribuição CloudFront
4. Configurar domínio customizado

### Opção 3: AWS EC2 (Para Backend Futuro)

**Quando usar:**

- Quando precisar de backend próprio
- APIs customizadas
- Banco de dados próprio

## 🔧 Configuração de Build

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy:amplify": "npm run build && aws s3 sync dist/ s3://your-bucket-name",
    "deploy:s3": "npm run build && aws s3 sync dist/ s3://your-bucket-name --delete"
  }
}
```

## 🌍 Variáveis de Ambiente

### Desenvolvimento (.env.local)

```env
VITE_APP_ENV=development
VITE_API_URL=http://localhost:3000/api
```

### Produção (AWS Amplify)

```env
VITE_APP_ENV=production
VITE_API_URL=https://sua-api.com/api
```

## 📊 Monitoramento e Logs

### AWS CloudWatch

- Logs de acesso
- Métricas de performance
- Alertas de erro

### AWS X-Ray (Opcional)

- Rastreamento de requests
- Performance insights

## 🔒 Segurança

### Headers de Segurança

```javascript
// vite.config.ts
export default {
  // ... outras configurações
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom"],
        },
      },
    },
  },
};
```

### HTTPS e SSL

- AWS Certificate Manager
- Redirecionamento HTTP → HTTPS
- Headers de segurança (HSTS, CSP)

## 💰 Estimativa de Custos (Mensal)

### Amplify Hosting

- **Básico**: $5-15/mês
- **Com domínio**: +$12/mês (.com)

### S3 + CloudFront

- **Storage**: $1-5/mês
- **Transfer**: $5-20/mês
- **Requests**: $1-3/mês

### EC2 (se precisar)

- **t3.micro**: $8-10/mês
- **t3.small**: $15-20/mês

## 🚀 Deploy Rápido - Passo a Passo

### 1. Preparar Código

```bash
npm run build
npm run test
```

### 2. AWS Amplify (Recomendado)

1. AWS Console → Amplify
2. "New app" → "Host web app"
3. GitHub → Autorizar → Selecionar repo
4. Branch: `main`
5. Build settings: Auto-detectado
6. "Save and deploy"

### 3. Configurar Domínio (Opcional)

1. Amplify Console → Domain management
2. "Add domain"
3. Configurar DNS (Route 53 ou externo)

## 🔧 Troubleshooting

### Build Errors

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Build local
npm run build
npm run preview
```

### 404 Errors (SPA)

```javascript
// amplify.yml - adicionar redirecionamento
redirects:
  - source: '/<*>'
    target: '/index.html'
    status: '200'
```

## 📱 Performance Otimizations

### Lazy Loading

```javascript
// Já implementado nas rotas
const Dashboard = lazy(() => import("./pages/Dashboard"));
```

### Bundle Analysis

```bash
npm install --save-dev rollup-plugin-visualizer
npm run build:analyze
```

### PWA (Futuro)

```bash
npm install --save-dev vite-plugin-pwa
```

## 🔄 CI/CD Pipeline

### GitHub Actions (Opcional)

```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm ci
      - run: npm run build
      - uses: aws-actions/configure-aws-credentials@v1
      - run: aws s3 sync dist/ s3://${{ secrets.S3_BUCKET }}
```

## 📞 Suporte

- **AWS Support**: Console AWS → Support
- **Docs Amplify**: https://docs.amplify.aws/
- **Docs S3**: https://docs.aws.amazon.com/s3/

---

**Próximos Passos:**

1. Escolher opção de deploy (Amplify recomendado)
2. Configurar repositório
3. Deploy!
4. Configurar domínio customizado
5. Monitoramento e otimizações
