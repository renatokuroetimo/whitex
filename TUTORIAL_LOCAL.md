# 🚀 Tutorial Completo - Desenvolvimento Local

Este tutorial te guiará passo a passo para configurar e executar o sistema completo localmente, incluindo web e apps móveis.

## 📋 Pré-requisitos

### ✅ Software Necessário

**Para Desenvolvimento Web:**

- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- Editor de código (VS Code recomendado)

**Para Desenvolvimento Mobile:**

- Todo o acima +
- [Xcode](https://developer.apple.com/xcode/) (apenas macOS, para iOS)
- [Android Studio](https://developer.android.com/studio) (para Android)
- [Java 11+](https://www.oracle.com/java/technologies/downloads/)

### 🗄️ Conta Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Crie uma conta gratuita

---

## 🌐 PARTE 1: Configuração Web

### 1️⃣ Clonar e Instalar

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/medical-auth-system.git
cd medical-auth-system

# Instale as dependências
npm install
```

### 2️⃣ Configurar Supabase

#### Criar Projeto

1. **Dashboard Supabase** → "New Project"
2. **Nome**: `medical-system`
3. **Database Password**: `SuaSenh@Forte123`
4. **Region**: `South America (São Paulo)`
5. Clique **"Create new project"** e aguarde ~2 minutos

#### Executar Scripts SQL

1. **Sidebar** → **SQL Editor**
2. Execute **na ordem**:

```sql
-- 1. Schema base (cole todo o conteúdo do arquivo)
-- Arquivo: supabase_setup.sql
```

```sql
-- 2. Metadados (cole todo o conteúdo)
-- Arquivo: create_metadata_options_tables.sql
```

```sql
-- 3. Indicadores (cole todo o conteúdo)
-- Arquivo: update_indicators_metadata_schema.sql
```

```sql
-- 4. Políticas de segurança (cole todo o conteúdo)
-- Arquivo: supabase_rls_policies.sql
```

```sql
-- 5. Dados iniciais (opcional)
-- Arquivo: populate_standard_indicators_final.sql
```

#### Obter Credenciais

1. **Sidebar** → **Settings** → **API**
2. Copie:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: `eyJhbGci...`

### 3️⃣ Configurar Ambiente

```bash
# Criar arquivo de ambiente
cp .env.example .env.local

# Editar com suas credenciais
nano .env.local
```

**Conteúdo do .env.local:**

```bash
VITE_SUPABASE_URL=https://SEU_ID_PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...SUA_CHAVE_PUBLICA
```

### 4️⃣ Executar Web

```bash
# Iniciar servidor de desenvolvimento
npm run dev
```

**🎉 Acesse:** `http://localhost:5173`

### 5️⃣ Testar Funcionalidades Web

1. **Criar conta** → "Médico" → CRM: `12345-SP`
2. **Dashboard** → Criar paciente de teste
3. **Indicadores** → Criar indicador personalizado
4. **Logout** → Criar conta "Paciente"
5. **Dashboard Paciente** → Adicionar indicadores

---

## 📱 PARTE 2: Configuração Mobile

### 1️⃣ Instalar Ferramentas

#### Para iOS (apenas macOS)

```bash
# Instalar Xcode via App Store
# Instalar Xcode Command Line Tools
xcode-select --install

# Instalar CocoaPods
sudo gem install cocoapods
```

#### Para Android

1. **Baixar [Android Studio](https://developer.android.com/studio)**
2. **Instalar** e abrir
3. **More Actions** → **SDK Manager**
4. **SDK Platforms** → Marcar **Android 13 (API 33)**
5. **SDK Tools** → Marcar **Android SDK Build-Tools**
6. **Apply** e aguardar download

```bash
# Adicionar ao ~/.bashrc ou ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Recarregar terminal
source ~/.bashrc  # ou ~/.zshrc
```

### 2️⃣ Configurar Capacitor

```bash
# Instalar Capacitor CLI globalmente
npm install -g @capacitor/cli

# Adicionar plataformas (do diretório do projeto)
npx cap add ios      # Para iOS
npx cap add android  # Para Android
```

### 3️⃣ Configurar App

#### Personalizar App

**Editar `capacitor.config.ts`:**

```typescript
const config: CapacitorConfig = {
  appId: "com.seudominio.saudemais", // ← Altere
  appName: "Saúde+", // ← Altere
  // ... resto igual
};
```

#### Adicionar Ícones

**Para iOS:**

1. Abrir `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
2. Substituir ícones (1024x1024, 60x60, etc.)

**Para Android:**

1. Abrir `android/app/src/main/res/`
2. Substituir ícones em `mipmap-*` (48x48, 72x72, etc.)

### 4️⃣ Build Inicial

```bash
# Build da aplicação mobile
npm run mobile:build

# Verificar se tudo funcionou
npm run mobile:sync
```

### 5️⃣ Testar em Simuladores

#### iOS Simulator

```bash
# Abrir Xcode
npm run mobile:ios

# No Xcode:
# 1. Selecionar simulador (iPhone 14)
# 2. Clicar no botão Play ▶️
# 3. Aguardar build e instalação
```

#### Android Emulator

```bash
# Criar emulador (primeira vez)
# Android Studio → AVD Manager → Create Virtual Device
# Pixel 7 → API 33 → Download → Finish

# Abrir Android Studio
npm run mobile:android

# No Android Studio:
# 1. Aguardar Gradle sync
# 2. Run → Run 'app'
# 3. Escolher emulador
```

### 6️⃣ Testar em Dispositivos Físicos

#### iOS Device

1. **Conectar iPhone** via cabo
2. **Xcode** → **Window** → **Devices and Simulators**
3. **Trust computer** no iPhone
4. **Xcode** → Selecionar seu iPhone
5. **Play** ▶️

#### Android Device

1. **Settings** → **About phone** → Tocar 7x em "Build number"
2. **Settings** → **Developer options** → **USB debugging** ON
3. **Conectar** via cabo
4. **Android Studio** → **Run** → Escolher device

---

## 🧪 PARTE 3: Testes e Desenvolvimento

### 🌐 Desenvolvimento Web

```bash
# Servidor com hot reload
npm run dev

# Verificar tipos TypeScript
npm run typecheck

# Executar testes
npm test

# Build de produção
npm run build

# Preview da build
npm run preview
```

### 📱 Desenvolvimento Mobile

```bash
# Desenvolvimento mobile com hot reload
npm run mobile:dev

# Em outro terminal, após mudanças:
npm run mobile:sync

# Live reload no simulador/device
```

### 🔄 Workflow de Desenvolvimento

1. **Fazer mudanças** no código `src/`
2. **Testar no web** primeiro: `npm run dev`
3. **Sincronizar mobile**: `npm run mobile:sync`
4. **Testar nos simuladores**
5. **Repetir ciclo**

---

## 🐛 Troubleshooting

### Problemas Comuns Web

**Erro: "Supabase URL not defined"**

```bash
# Verificar .env.local
cat .env.local
# Deve conter VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Reiniciar servidor
npm run dev
```

**Erro: Database connection**

- Verificar se scripts SQL foram executados
- Conferir URL e chave no Supabase Dashboard

### Problemas Comuns Mobile

**iOS: "No provisioning profile"**

```bash
# Xcode → Signing & Capabilities
# Team: Selecionar seu Apple ID
# Automatically manage signing: ✅
```

**Android: "SDK not found"**

```bash
# Verificar Android Studio SDK Manager
# Instalar Android 13 (API 33)
# Verificar variáveis ANDROID_HOME
echo $ANDROID_HOME
```

**Capacitor: "Platform not found"**

```bash
# Re-adicionar plataformas
npx cap clean
npx cap add ios
npx cap add android
npm run mobile:build
```

### Comandos de Reset

```bash
# Reset completo mobile
rm -rf node_modules
rm -rf ios android
npm install
npx cap add ios android
npm run mobile:build

# Reset completo web
rm -rf node_modules dist
npm install
npm run dev
```

---

## 🎯 Próximos Passos

Após completar este tutorial:

1. **✅ Ambiente funcionando** - Web e mobile operacionais
2. **📱 Personalização** - Ícones, cores, nome do app
3. **🚀 Deploy** - Web no Amplify, apps nas lojas
4. **👥 Usuários reais** - Convite para testes beta
5. **📊 Monitoramento** - Analytics e crash reports

---

## 📞 Suporte

**Problemas com o tutorial?**

1. **Verificar logs** no terminal
2. **Consultar documentação** oficial:
   - [Capacitor](https://capacitorjs.com/)
   - [Supabase](https://supabase.com/docs)
   - [React](https://react.dev/)
3. **Issues** no repositório GitHub
4. **Community** Discord/Forum

**Logs úteis:**

```bash
# Debug web
npm run dev -- --debug

# Debug mobile
npx cap run ios --external
npx cap run android --log
```

---

🎉 **Parabéns!** Você agora tem um ambiente completo de desenvolvimento funcionando para web e mobile!
