# 🚀 Deploy Rápido - 15 Minutos

## 🏃‍♂️ Deploy em 3 Passos (AWS Amplify)

### 1️⃣ Preparar Repositório (5 min)

```bash
# Se ainda não tem repositório no GitHub
git remote add origin https://github.com/seu-usuario/medical-app.git
git add .
git commit -m "🚀 Sistema médico completo - pronto para deploy"
git push -u origin main
```

### 2️⃣ AWS Amplify Deploy (5 min)

1. **Acesse**: https://console.aws.amazon.com/amplify/
2. **Clique**: "New app" → "Host web app"
3. **Conecte**: GitHub → Autorizar → Selecionar repositório
4. **Configure**:
   - Branch: `main`
   - Build command: `npm run build`
   - Output directory: `dist`
5. **Clique**: "Save and deploy"

### 3️⃣ Aguardar Deploy (5 min)

- ⏳ Build automático
- 🌍 URL gerada automaticamente
- ✅ Sistema online!

**URL exemplo**: `https://main.d1234567890.amplifyapp.com`

---

## 🛠️ Alternativa: Deploy Manual S3

### Pré-requisitos

```bash
# Instalar AWS CLI
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Configurar credenciais
aws configure
```

### Deploy

```bash
# 1. Build
npm run build

# 2. Criar bucket (primeira vez)
aws s3 mb s3://medical-app-prod

# 3. Upload
aws s3 sync dist/ s3://medical-app-prod --delete

# 4. Configurar website
aws s3 website s3://medical-app-prod --index-document index.html
```

**URL**: `http://medical-app-prod.s3-website.amazonaws.com`

---

## ⚡ Deploy Ultra-Rápido (Netlify/Vercel)

### Netlify (1 clique)

1. Acesse: https://app.netlify.com/
2. Arraste pasta `dist/` para o site
3. Sistema online em 30 segundos!

### Vercel (1 comando)

```bash
npx vercel
# Seguir prompts
# Deploy automático
```

---

## 🔧 Configurações Essenciais

### Environment Variables (Produção)

```env
VITE_APP_ENV=production
VITE_API_URL=https://api.seudominio.com
```

### Headers de Segurança

```yaml
# netlify.toml ou amplify.yml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
```

### SPA Redirects

```yaml
# amplify.yml
redirects:
  - source: "/<*>"
    target: "/index.html"
    status: "200"
```

---

## ✅ Verificação Pós-Deploy

### Teste Rápido

1. 🏠 **Homepage**: Formulário de registro carrega
2. 🔐 **Login**: Página de login funciona
3. 👨‍⚕️ **Profissão**: Seleção médico/paciente
4. 🏥 **CRM**: Validação para médicos
5. 📊 **Dashboard**: Área protegida acessível

### Performance Check

```bash
# Lighthouse CLI
npm install -g lighthouse
lighthouse https://sua-url.com --view
```

**Meta**: Score > 90 em todas as categorias

---

## 🆘 Solução de Problemas

### Build Error

```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 Errors

Configurar redirecionamento SPA (já incluído nos arquivos)

### Slow Loading

- Verificar tamanho do bundle
- Otimizar imagens
- Configurar CDN

---

## 📊 Monitoramento Básico

### Google Analytics (Opcional)

```typescript
// src/lib/analytics.ts
export const trackPageView = (url: string) => {
  if (typeof gtag !== "undefined") {
    gtag("config", "GA_TRACKING_ID", {
      page_path: url,
    });
  }
};
```

### Uptime Monitoring

- **UptimeRobot**: https://uptimerobot.com/
- **Pingdom**: https://www.pingdom.com/

---

## 🎉 Resultado Final

✅ **Sistema médico online**  
✅ **SSL/HTTPS automático**  
✅ **CDN global**  
✅ **Mobile-friendly**  
✅ **Deploy automático**

**Próximos passos**:

1. Configurar domínio customizado
2. Adicionar analytics
3. Implementar backend
4. Escalar conforme uso

**🌍 Seu sistema está no ar!** 🚀
