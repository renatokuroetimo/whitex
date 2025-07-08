# 📱 Setup do App Móvel - Pacientes

Este guia explica como configurar e distribuir o app móvel focado em pacientes.

## 🎯 Objetivo

Criar um app nativo para iOS e Android que contenha **apenas** as funcionalidades de pacientes, sem impactar o projeto web existente.

## 🚀 Configuração Inicial

### 1. Instalar dependências

```bash
npm install
```

### 2. Adicionar plataformas nativas

```bash
# iOS (requer macOS e Xcode)
npx cap add ios

# Android (requer Android Studio)
npx cap add android
```

### 3. Build inicial

```bash
npm run mobile:build
```

## 📱 Desenvolvimento

### Modo de desenvolvimento

```bash
# Executar em modo mobile com hot reload
npm run mobile:dev
```

### Testar no dispositivo

```bash
# iOS
npm run mobile:ios

# Android
npm run mobile:android
```

## 🔄 Workflow de Build

### 1. Build para produção

```bash
npm run mobile:build
```

### 2. Sincronizar com plataformas

```bash
npm run mobile:sync
```

### 3. Abrir no IDE nativo

```bash
# Xcode (iOS)
npm run mobile:ios

# Android Studio
npm run mobile:android
```

## 📦 Funcionalidades do App

### Incluídas ✅

- Dashboard do paciente
- Gerenciamento de indicadores de saúde
- Visualização de gráficos
- Busca de médicos
- Perfil do usuário
- Autenticação segura

### Não incluídas ❌

- Área administrativa
- Gerenciamento hospitalar
- Funcionalidades de médicos
- Gestão de outros pacientes

## 🛠️ Customizações Mobile

### Ícones e Splash Screen

- Colocar ícones em: `android/app/src/main/res/` e `ios/App/App/Assets.xcassets/`
- Splash screen personalizado definido em `capacitor.config.ts`

### Configurações específicas

```typescript
// capacitor.config.ts
plugins: {
  SplashScreen: {
    launchShowDuration: 2000,
    backgroundColor: "#4285f4", // Cor do tema
  },
  StatusBar: {
    style: "dark",
    backgroundColor: "#4285f4",
  },
}
```

## 🔐 Segurança

- **Isolamento completo**: App só aceita logins de pacientes
- **Rotas protegidas**: Verificação de tipo de usuário em todas as rotas
- **Dados seguros**: Mesma infraestrutura de autenticação do web

## 🚀 Deploy para Lojas

### iOS App Store

1. Abrir projeto no Xcode: `npm run mobile:ios`
2. Configurar provisioning profiles
3. Build para Release
4. Upload via Xcode ou App Store Connect

### Google Play Store

1. Abrir projeto no Android Studio: `npm run mobile:android`
2. Gerar APK/AAB assinado
3. Upload na Google Play Console

## 🔧 Manutenção

### Atualizar app

```bash
# Após mudanças no código web
npm run mobile:build

# Sincronizar mudanças
npm run mobile:sync
```

### Não impacta o web

- O projeto web continua funcionando normalmente
- Arquivos específicos mobile não afetam a versão web
- Deploy independente

## 📞 Plugins Disponíveis

O app já inclui plugins essenciais:

- **App**: Controle do ciclo de vida
- **Haptics**: Feedback tátil
- **Keyboard**: Controle do teclado
- **Splash Screen**: Tela de carregamento
- **Status Bar**: Controle da barra de status

## 🎨 Temas e Styling

O app herda todo o sistema de design existente:

- TailwindCSS
- Componentes UI Radix
- Cores e tokens do projeto
- Dark mode support
