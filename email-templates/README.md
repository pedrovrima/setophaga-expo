# Templates de Email - Xará

Este diretório contém os templates de email personalizados para o Xará, usando as cores e identidade visual do aplicativo.

## Templates Disponíveis

### 1. Recuperar Senha (`recuperar-senha.html`)
Template para o fluxo de recuperação de senha.

**Variável Supabase:** `{{ .ConfirmationURL }}`
**Uso:** Supabase Auth

### 2. Confirmar Usuário (`confirmar-usuario.html`)
Template para confirmação de email ao criar uma nova conta.

**Variável Supabase:** `{{ .ConfirmationURL }}`
**Uso:** Supabase Auth

### 3. Beta Testers (`beta-testers.html`)
Template para email de boas-vindas aos beta testers.

**Variáveis:** Nenhuma (HTML estático)
**Uso:** Resend (envio manual)
**Guia de envio:** Ver `enviar-beta-testers-resend.md`

## Cores Utilizadas

Os templates seguem a paleta de cores do Xará:

- **Primária:** `#6750A4` (roxo)
- **Background:** `#FFFBF7` (bege claro)
- **Surface:** `#FFFFFF` (branco)
- **Surface Tint:** `#FEF7FF` (roxo muito claro)
- **Border:** `#EAE6FF` (roxo claro)
- **Texto Principal:** `#1A1A1A`
- **Texto Secundário:** `#49454F`
- **Texto Muted:** `#6B6B6B`
- **Sucesso:** `#2E7D32` / `#E8F5E9`

## Como Configurar no Supabase

⚠️ **IMPORTANTE:** Antes de usar os templates, você PRECISA configurar as URLs de redirecionamento no Supabase, caso contrário os links não funcionarão.

📖 **[Leia o guia completo de configuração →](CONFIGURACAO-SUPABASE.md)**

### Resumo Rápido

1. **Configure as Redirect URLs** em Authentication → URL Configuration:
   - Adicione: `https://xara-roan.vercel.app/reset-password`
   - Adicione: `https://xara-roan.vercel.app/auth-callback`

2. **Configure os Templates** em Authentication → Email Templates:
   - **Reset Password:** Cole `recuperar-senha.html`
   - **Confirm Signup:** Cole `confirmar-usuario.html`

3. **Teste os fluxos** antes de publicar

### Configurar o Logo (Opcional)

Se você quiser hospedar o logo localmente ao invés de usar a URL do Vercel:

1. Faça upload do arquivo `assets/logo.png` para o Supabase Storage
2. Obtenha a URL pública da imagem
3. Substitua `https://xara-roan.vercel.app/assets/assets/logo.205ac8f44cd978916998466b535f0082.png` pela nova URL nos templates

## Variáveis do Supabase

Os templates usam as variáveis padrão do Supabase:

- `{{ .ConfirmationURL }}` - URL de confirmação gerada automaticamente
- `{{ .SiteURL }}` - URL do site (opcional, não utilizada atualmente)
- `{{ .Token }}` - Token de confirmação (opcional, não utilizada atualmente)
- `{{ .TokenHash }}` - Hash do token (opcional, não utilizada atualmente)

## Sobre o Xará

O Xará é uma plataforma colaborativa para registro de nomes populares e sinônimos de aves brasileiras, permitindo que usuários contribuam com variações regionais dos nomes das espécies.

## Recursos

- **Design Responsivo:** Os templates são otimizados para desktop e mobile
- **Compatibilidade:** Testado com clientes de email comuns (Gmail, Outlook, Apple Mail)
- **Acessibilidade:** Uso de tabelas HTML para máxima compatibilidade com email clients
- **Brand Consistency:** Usa as cores, fontes e estilo visual do Xará

## Personalização

Para personalizar os templates:

1. Edite os arquivos HTML diretamente
2. Mantenha as variáveis `{{ .ConfirmationURL }}` intactas
3. Use as cores da paleta do Xará definidas em `src/theme/tokens.ts`
4. Teste os emails antes de publicar

## Testes

Você pode testar os templates:

1. Criando uma nova conta no app
2. Usando a funcionalidade "Esqueci minha senha"
3. Verificando os emails recebidos

## Suporte

Para mais informações sobre templates de email no Supabase:
- [Documentação de Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)
- [Customização de Auth](https://supabase.com/docs/guides/auth/auth-helpers)
