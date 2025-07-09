# Fix: Safe Area para Mobile

## Problema Resolvido

- Conteúdo invadindo a área da status bar/notch em dispositivos móveis
- Headers se misturando com elementos do sistema operacional

## Mudanças Implementadas

### 1. **CSS Safe Area Support** (`src/index.css`)

- Adicionado suporte para `env(safe-area-inset-*)`
- Classes `.mobile-header` e `.mobile-content`
- Compatibilidade com iOS (`constant()` fallback)
- Prevenção de zoom em inputs mobile

### 2. **MobileLayout Component** (`src/components/MobileLayout.tsx`)

- Header com classe `mobile-header` (safe area top)
- Content com classe `mobile-content` (safe area bottom)
- Container com classe `mobile-container` (viewport dinâmico)
- Integração do hook `useStatusBar`

### 3. **ResponsiveSidebar Component** (`src/components/ResponsiveSidebar.tsx`)

- Header atualizado com safe area support

### 4. **StatusBar Hook** (`src/hooks/use-status-bar.ts`)

- Configuração automática da StatusBar no Capacitor
- Estilo escuro com fundo branco
- Detecção de plataforma nativa

## CSS Classes Criadas

```css
.mobile-header {
  padding-top: max(1rem, env(safe-area-inset-top));
}

.mobile-content {
  padding-bottom: max(0px, env(safe-area-inset-bottom));
}

.mobile-container {
  min-height: 100vh;
  min-height: 100dvh; /* Dynamic viewport height */
}
```

## Resultado

✅ Headers respeitam a safe area  
✅ Conteúdo não invade áreas do sistema  
✅ StatusBar configurada corretamente  
✅ Compatibilidade iOS/Android  
✅ Viewport dinâmico para PWA

## Como Testar

1. Build mobile: `npm run mobile:build`
2. Sync: `npm run mobile:sync`
3. Testar no dispositivo/emulador
4. Verificar se header não invade status bar
