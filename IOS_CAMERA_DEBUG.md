# Debug Adicional - Câmera iOS

## Problema Persistente
Mesmo após implementar o plugin @capacitor/camera e adicionar permissões, o app ainda crasha no iOS ao tentar tirar foto.

## Modificações Adicionais Implementadas

### 1. Logs Detalhados no Hook
Adicionado console.logs extensivos para diagnosticar onde está falhando:

```typescript
console.log("🔍 Verificando plataforma:", Capacitor.getPlatform());
console.log("🔍 É nativo?", Capacitor.isNativePlatform());
console.log("📸 Tentando usar plugin Capacitor Camera");
// ... mais logs de erro detalhados
```

### 2. Permissão Adicional
Adicionada permissão de microfone que pode ser necessária:

```xml
<key>NSMicrophoneUsageDescription</key>
<string>Este aplicativo pode precisar acessar o microfone para gravar vídeos junto com a câmera.</string>
```

### 3. Configuração do Plugin
Adicionada configuração explícita no `capacitor.config.ts`:

```typescript
Camera: {
  // Configurações para melhor funcionamento da câmera
},
```

### 4. Estratégia de Fallback Melhorada
Alterada a lógica para sempre tentar Capacitor primeiro, depois fallback para web se necessário.

## Como Diagnosticar

### No Xcode
1. Abrir o projeto: `npx cap open ios`
2. Conectar dispositivo iOS real
3. Abrir "Window" > "Devices and Simulators"
4. Selecionar dispositivo e ver "Console" para logs em tempo real
5. Executar app e tentar tirar foto
6. Verificar logs detalhados no console

### Verificações Manuais

#### 1. Permissões no Dispositivo
- Ir em Configurações > WhiteX
- Verificar se "Câmera" e "Fotos" estão habilitados
- Se não aparecer, é porque o app nunca solicitou

#### 2. Verificar se Plugin Está Funcionando
Os logs devem mostrar:
```
🔍 Verificando plataforma: ios
🔍 É nativo? true
📸 Tentando usar plugin Capacitor Camera
```

#### 3. Possíveis Erros
- **"Plugin not available"**: Plugin não está registrado
- **"Permission denied"**: Usuário negou permissão
- **"Camera not available"**: Problemas de hardware
- **Crash sem logs**: Problema nas permissões do Info.plist

## Próximos Passos se Ainda Falhar

### 1. Verificar Instalação dos Pods
No terminal, dentro da pasta do projeto:
```bash
cd ios/App
pod install
```

### 2. Limpar e Rebuildar
```bash
npx cap clean ios
npm run build
npx cap sync ios
npx cap open ios
```

### 3. Verificar se há Conflitos
Verificar se não há outros plugins de câmera ou conflitos de dependências.

### 4. Testar com Configuração Mínima
Testar com configuração mais simples:
```typescript
const image = await Camera.getPhoto({
  resultType: CameraResultType.DataUrl,
  source: CameraSource.Camera, // Força apenas câmera
  quality: 90
});
```

## Informações de Debug Esperadas

Quando funcionar corretamente, os logs devem mostrar:
1. Plataforma detectada como "ios"
2. Plugin Capacitor tentando acessar câmera
3. iOS solicitando permissão (primeira vez)
4. Foto capturada com sucesso
5. DataURL retornada

Se crashar, precisamos ver exatamente onde está falhando através dos logs do Xcode.
