# 🔧 Troubleshooting - Conectividade Supabase Mobile

## Problema Identificado

O app mobile não está conectando ao Supabase em produção quando executado via `npm run mobile:ios`.

## ✅ Soluções Implementadas

### 1. Arquivo `.env` de Produção

Criado arquivo `.env` com as configurações corretas:

```env
VITE_SUPABASE_URL=https://ogyvioeeaknagslworyz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_MODE=web
NODE_ENV=production
```

### 2. Capacitor Config Atualizado

- Removido `hostname: "localhost"` para permitir acesso externo
- Adicionadas configurações de produção para iOS e Android
- Habilitado `CapacitorHttp` para melhor handling de requests

### 3. Debug de Conectividade

- Melhorado logging no `src/lib/supabase.ts`
- Criado componente `DebugConnectivity` para testes
- Adicionada rota `/debug` no app mobile

## 🧪 Como Testar

### Teste 1: Build e Deploy Mobile

```bash
npm run mobile:build
npm run mobile:ios
```

### Teste 2: Página de Debug

No app mobile, navegue para `/debug` para ver:

- Status da conectividade
- Variáveis de ambiente
- Logs detalhados

### Teste 3: Logs do Console

No iOS Simulator ou device:

1. Abra o Safari
2. Vá em Develop > [Seu Device] > [App]
3. Verifique os logs do console

## 🔍 Diagnóstico de Problemas

### Problema: Variáveis de Ambiente Não Carregam

**Sintomas:**

- Console mostra "❌ NOT SET" para variáveis
- Fallback configuration sendo usada

**Soluções:**

1. Verificar se `.env` existe na raiz do projeto
2. Rebuild o app: `npm run mobile:build`
3. Sync capacitor: `npm run mobile:sync`

### Problema: Erro de Rede

**Sintomas:**

- Timeout em requests
- Erro de conectividade no debug

**Soluções:**

1. Verificar conexão de internet do device/simulator
2. Verificar se URL do Supabase está correta
3. Testar URL manualmente: `curl -I https://ogyvioeeaknagslworyz.supabase.co`

### Problema: CORS ou Esquema de URL

**Sintomas:**

- Erro de CORS
- "Mixed content" warnings

**Soluções:**

1. Configuração já ajustada no `capacitor.config.ts`
2. Verificar se `androidScheme` e `iosScheme` estão como "https"

## 📱 Scripts Úteis

```bash
# Build completo para mobile
npm run mobile:build

# Abrir iOS
npm run mobile:ios

# Abrir Android
npm run mobile:android

# Sync com plataformas nativas
npm run mobile:sync

# Teste de conectividade
npm run mobile:test
```

## 🐛 Debug Steps

1. **Verificar Build**:

   ```bash
   npm run mobile:build
   ```

2. **Verificar Logs Detalhados**:

   - No app, ir para `/debug`
   - Verificar console do browser/device

3. **Testar Conectividade Manual**:

   ```bash
   curl -I https://ogyvioeeaknagslworyz.supabase.co
   ```

4. **Verificar Capacitor**:
   ```bash
   npx cap doctor
   ```

## 📋 Checklist de Verificação

- [ ] Arquivo `.env` existe e tem as variáveis corretas
- [ ] Build mobile executado com sucesso
- [ ] Capacitor sincronizado (`npm run mobile:sync`)
- [ ] Device/simulator tem conexão de internet
- [ ] URL do Supabase responde (teste curl)
- [ ] Console não mostra erros de CORS
- [ ] Página `/debug` mostra conectividade OK

## 🆘 Se Ainda Não Funcionar

1. **Limpar cache completo**:

   ```bash
   rm -rf dist/
   rm -rf node_modules/
   npm install
   npm run mobile:build
   ```

2. **Verificar logs nativos**:

   - iOS: Xcode Console
   - Android: Android Studio Logcat

3. **Testar em device real** (não apenas simulator)

4. **Verificar políticas RLS do Supabase** (se necessário)
