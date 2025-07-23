# Correção do Crash de Câmera no iOS

## Problema

O app estava crashando no iOS ao tentar usar a câmera para salvar foto de perfil devido à falta de permissões necessárias.

## Correções Implementadas

### 1. Permissões no Info.plist

Adicionadas as seguintes permissões no arquivo `ios/App/App/Info.plist`:

```xml
<key>NSCameraUsageDescription</key>
<string>Este aplicativo precisa acessar a câmera para que você possa tirar fotos de perfil.</string>
<key>NSPhotoLibraryUsageDescription</key>
<string>Este aplicativo precisa acessar sua biblioteca de fotos para que você possa selecionar uma foto de perfil.</string>
<key>NSPhotoLibraryAddUsageDescription</key>
<string>Este aplicativo precisa acessar sua biblioteca de fotos para salvar suas fotos de perfil.</string>
```

### 2. Plugin Oficial do Capacitor

- Instalado o plugin `@capacitor/camera`
- Atualizado o `Podfile` para incluir o plugin
- Sincronizado com `npx cap sync ios`

### 3. Hook Customizado para Câmera

Criado `src/hooks/use-camera.ts` com:

- Tratamento adequado de erros de permissão
- Fallback para web usando input file
- Melhor experiência do usuário com mensagens de erro claras
- Suporte tanto para câmera quanto galeria

### 4. Interface Melhorada

Atualizado `PatientProfile.tsx` com:

- Botões separados para Câmera e Galeria
- Indicador de processamento
- Melhor tratamento de erros
- Fallback gracioso para plataformas web

## Como Testar

1. **Build e Deploy iOS:**

   ```bash
   npm run build
   npx cap sync ios
   npx cap open ios
   ```

2. **No Xcode:**
   - Abrir o projeto no Xcode
   - Build e rodar no dispositivo iOS real (não funciona no simulador)
   - Na primeira vez, o iOS vai pedir permissão para câmera e galeria

3. **Testar Funcionalidades:**
   - Ir para Perfil do Paciente
   - Tentar tirar foto com câmera
   - Tentar selecionar da galeria
   - Verificar se não há mais crashes

## Notas Importantes

- **Dispositivo Real**: Teste apenas em dispositivo real, simulador iOS não tem câmera
- **Primeira Execução**: Na primeira vez o iOS vai solicitar permissões
- **Configurações**: Se o usuário negar permissões, deve ir em Configurações > WhiteX > Câmera/Fotos
- **Fallback Web**: Quando rodando na web, usa input file tradicional

## Próximos Passos

1. Testar em dispositivo iOS real
2. Se necessário, ajustar mensagens de erro
3. Considerar adicionar tutorial sobre permissões para usuários
4. Aplicar as mesmas correções em outras telas que usam câmera
