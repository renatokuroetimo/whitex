# ✅ Checklist de Deploy - Sistema Médico

## 📋 Pré-Deploy

### Verificações Locais

- [ ] `npm run build` - Build sem erros
- [ ] `npm run typecheck` - Sem erros TypeScript
- [ ] `npm test` - Todos os testes passando
- [ ] `npm run preview` - Preview funcional

### Verificações Git

- [ ] Todas as mudanças commitadas
- [ ] Branch `main` atualizada
- [ ] Repository remoto configurado

### Verificações AWS

- [ ] Conta AWS ativa
- [ ] Permissões necessárias
- [ ] AWS CLI configurado (se S3)

## 🚀 Opções de Deploy

### 🌟 Opção 1: AWS Amplify (RECOMENDADO)

**Vantagens:**

- ✅ Deploy automático via Git
- ✅ SSL/HTTPS automático
- ✅ CDN global
- ✅ Rollbacks fáceis
- ✅ Preview de branches
- ✅ Logs detalhados

**Passos:**

1. **Criar App no Amplify**

   ```
   AWS Console → Amplify → New app → Host web app
   ```

2. **Conectar Repositório**

   - GitHub: Autorizar AWS Amplify
   - GitLab: Configurar OAuth
   - Selecionar repositório e branch `main`

3. **Configurar Build**

   ```yaml
   # Build settings (auto-detectado)
   Build command: npm run build
   Output directory: dist
   Node version: 18
   ```

4. **Deploy**

   - Clique em "Save and deploy"
   - Aguardar ~5-10 minutos
   - URL será gerada automaticamente

5. **Configurar Domínio (Opcional)**
   ```
   Amplify Console → Domain management → Add domain
   ```

**URLs:**

- **Staging**: `https://main.d1234567890.amplifyapp.com`
- **Produção**: `https://seu-dominio.com`

### ⚙️ Opção 2: AWS S3 + CloudFront

**Quando usar:**

- Máximo controle
- Menor custo
- Integração com outros serviços AWS

**Passos:**

1. **Criar Bucket S3**

   ```bash
   aws s3 mb s3://medical-app-prod
   aws s3 website s3://medical-app-prod --index-document index.html
   ```

2. **Upload Build**

   ```bash
   npm run build
   aws s3 sync dist/ s3://medical-app-prod --delete
   ```

3. **Configurar CloudFront**

   ```bash
   # Criar distribuição via Console AWS
   # Origin: S3 bucket
   # Default root object: index.html
   # Error pages: 404 → /index.html (para SPA)
   ```

4. **Configurar Domínio**
   ```bash
   # Route 53 ou DNS externo
   # CNAME: seu-dominio.com → d123456.cloudfront.net
   ```

### 🖥️ Opção 3: AWS EC2 (Para Backend Futuro)

**Quando usar:**

- Precisa de backend customizado
- APIs próprias
- Banco de dados gerenciado

## 📊 Verificações Pós-Deploy

### Performance

- [ ] **Lighthouse Score** > 90
- [ ] **Loading Time** < 3s
- [ ] **Mobile Friendly** ✅
- [ ] **PWA Ready** (futuro)

### Funcionalidades

- [ ] **Registro** funcionando
- [ ] **Login** funcionando
- [ ] **Proteção de rotas** ativa
- [ ] **Dashboard** acessível
- [ ] **Responsivo** em mobile

### Segurança

- [ ] **HTTPS** ativo
- [ ] **Headers de segurança** configurados
- [ ] **SPA redirects** funcionando
- [ ] **No console errors**

### SEO & Acessibilidade

- [ ] **Meta tags** corretas
- [ ] **Títulos** apropriados
- [ ] **Alt texts** em imagens
- [ ] **Contraste** adequado

## 🔧 Troubleshooting

### Erro: Build Failed

```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Erro: 404 em Rotas

```yaml
# amplify.yml - adicionar
redirects:
  - source: "/<*>"
    target: "/index.html"
    status: "200"
```

### Erro: Environment Variables

```bash
# Amplify Console → Environment variables
VITE_APP_ENV=production
VITE_API_URL=https://api.seudominio.com
```

### Erro: Deploy Timeout

```yaml
# amplify.yml - aumentar timeout
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci --timeout=600000
```

## 💰 Estimativa de Custos

### AWS Amplify

- **Hosting**: $0.01/GB/mês
- **Build**: $0.01/minuto
- **Requests**: $0.15/1M
- **SSL**: Grátis
- **Total estimado**: $5-15/mês

### S3 + CloudFront

- **S3 Storage**: $0.023/GB/mês
- **CloudFront**: $0.085/GB
- **Requests**: $0.40/1M
- **Total estimado**: $3-10/mês

### EC2 (se precisar)

- **t3.micro**: $8/mês
- **t3.small**: $16/mês
- **Load Balancer**: $20/mês

## 📈 Monitoramento

### AWS CloudWatch

- **Logs de aplicação**
- **Métricas de performance**
- **Alertas automáticos**

### Métricas Importantes

- **Uptime**: >99.9%
- **Response Time**: <1s
- **Error Rate**: <0.1%
- **Page Views**: Acompanhar crescimento

## 🔄 CI/CD (Futuro)

### GitHub Actions

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
      - run: npm run deploy:s3
```

## 📞 Suporte

### Documentação

- **AWS Amplify**: https://docs.amplify.aws/
- **AWS S3**: https://docs.aws.amazon.com/s3/
- **Vite**: https://vitejs.dev/guide/

### Comandos Úteis

```bash
# Logs do Amplify
amplify console

# Status do build
amplify status

# Rollback
amplify revert

# Logs detalhados
amplify configure --debug
```

---

## 🎯 Deploy em Produção - Passo a Passo

1. ✅ **Verificar checklist acima**
2. 🔗 **Conectar repositório ao GitHub**
3. ☁️ **Configurar AWS Amplify**
4. 🚀 **Deploy automático**
5. 🌍 **Configurar domínio**
6. 📊 **Monitorar performance**

**Tempo estimado**: 30-60 minutos
**Resultado**: Sistema médico em produção! 🎉
