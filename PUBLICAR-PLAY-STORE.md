# Guia: Publicar Nova Versão no Google Play Console

## 📋 Checklist Antes de Publicar

- [ ] Todas as mudanças foram testadas
- [ ] Templates de email configurados no Supabase
- [ ] URLs de redirecionamento configuradas
- [ ] App funciona corretamente em produção (web)

## 🔢 Passo 1: Incrementar Versão

Edite o arquivo `app.json`:

```json
{
  "expo": {
    "version": "1.0.0",  // ← Atualize aqui (ex: 0.9.1 → 1.0.0)
    "android": {
      "versionCode": 10,  // ← Incremente sempre: 9 → 10
      ...
    }
  }
}
```

**Importante:**
- `version`: Versão visível para usuários (ex: "1.0.0")
- `versionCode`: Número sequencial que sempre aumenta (9 → 10 → 11...)

## 🏗️ Passo 2: Criar Build de Produção

### Opção 1: Build via EAS (Recomendado)

```bash
# Login no EAS (se ainda não estiver logado)
npx eas login

# Criar build de produção (.aab)
npx eas build --platform android --profile production
```

⏰ **Tempo:** ~10-20 minutos (build acontece na nuvem)

### Opção 2: Build Local (se tiver ambiente configurado)

```bash
# Gerar AAB localmente
npx expo prebuild --platform android
cd android
./gradlew bundleRelease
```

O arquivo estará em: `android/app/build/outputs/bundle/release/app-release.aab`

## 📦 Passo 3: Download do Build

Se usou EAS:

1. Quando o build terminar, você receberá um link no terminal
2. Ou acesse: https://expo.dev/accounts/[seu-usuario]/projects/setophaga-expo/builds
3. Baixe o arquivo `.aab`

## 📤 Passo 4: Upload no Play Console

### Acesse o Google Play Console

1. Vá para https://play.google.com/console
2. Selecione o app **Xará**
3. Navegue: **Produção** → **Criar nova versão**

### Upload do AAB

1. Clique em **Fazer upload** na seção "App bundles"
2. Selecione o arquivo `.aab` baixado
3. Aguarde o upload completar

### Preencher Informações da Versão

**Nome da versão:** 1.0.0 (ou a que você escolheu)

**Notas da versão (em português - Brasil):**

```
Melhorias nesta versão:

• Sistema de recuperação de senha aprimorado
• Novos templates de email personalizados
• Correções de bugs e melhorias de desempenho
• Fluxo de confirmação de cadastro otimizado
```

### Salvar e Publicar

1. Clique em **Salvar**
2. Revise as informações
3. Clique em **Revisar versão**
4. Se tudo estiver OK, clique em **Iniciar lançamento para produção**

## ⏱️ Passo 5: Aguardar Aprovação

- **Tempo de revisão:** Normalmente 1-3 dias
- Você receberá um email quando for aprovado
- O app ficará disponível automaticamente após aprovação

## 🧪 Teste Interno (Opcional mas Recomendado)

Antes de publicar em produção, você pode testar:

### 1. Criar faixa de teste interno

No Play Console:
- Vá em **Testes** → **Teste interno**
- Crie uma nova versão de teste
- Faça upload do mesmo `.aab`

### 2. Adicionar testadores

- Adicione emails dos testadores
- Eles receberão um link para testar

### 3. Promover para produção

Depois de testar:
- **Promover versão** → Produção
- Mais rápido que criar nova build

## 📝 Comandos Úteis

```bash
# Ver versão atual
cat app.json | grep -A 2 '"version"'

# Login no EAS
npx eas login

# Build de produção
npx eas build --platform android --profile production

# Ver builds anteriores
npx eas build:list --platform android

# Verificar status de um build
npx eas build:view [BUILD_ID]
```

## 🔧 Troubleshooting

### Erro: "Version code 9 has already been used"

**Solução:** Incremente o `versionCode` no `app.json`
```json
"versionCode": 10  // Era 9, agora 10
```

### Erro: "You need to accept the Play App Signing terms"

**Solução:** No Play Console:
1. Vá em **Configuração** → **Integridade do app**
2. Configure o App Signing do Google Play

### Build demora muito

**Normal!** Builds EAS podem levar 15-20 minutos.
- Você pode fechar o terminal, o build continua
- Acesse o dashboard para ver progresso

### Erro de assinatura

Se o build falhar por falta de credenciais:

```bash
# Configure as credenciais
npx eas credentials
```

## 📱 Após a Publicação

### Verificar instalação

Depois de aprovado, teste:
1. Busque "Xará" no Google Play Store
2. Instale em um dispositivo real
3. Teste os principais fluxos:
   - Login/Cadastro
   - Recuperação de senha
   - Busca de espécies
   - Registro de sinônimos

### Monitorar

No Play Console:
- **Painel principal:** Downloads, crashes, avaliações
- **Android vitals:** Performance, crashes, ANRs
- **Feedback dos usuários:** Avaliações e comentários

## 🚀 Releases Futuras

Para as próximas versões:

1. Incremente sempre o `versionCode`
2. Atualize a `version` seguindo semver
3. Documente as mudanças nas notas da versão
4. Considere usar faixas de lançamento gradual (5% → 20% → 50% → 100%)

## 📞 Links Úteis

- **EAS Build Dashboard:** https://expo.dev/accounts/[usuario]/projects/setophaga-expo/builds
- **Google Play Console:** https://play.google.com/console
- **Docs EAS Build:** https://docs.expo.dev/build/introduction/
- **Docs Android Publishing:** https://docs.expo.dev/submit/android/
