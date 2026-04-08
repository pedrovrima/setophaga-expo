# Configuração do Supabase para Emails

## 1. Configurar URL de Redirecionamento

### Acesse: Authentication → URL Configuration

Adicione as seguintes URLs em **Redirect URLs**:

```
https://xara-roan.vercel.app/reset-password
https://xara-roan.vercel.app/auth-callback
```

### Site URL

Configure o **Site URL** como:
```
https://xara-roan.vercel.app
```

## 2. Configurar Templates de Email

### Acesse: Authentication → Email Templates

### A. Template de "Reset Password" (Recuperar Senha)

1. Selecione **"Reset Password"** na lista
2. Cole o conteúdo do arquivo `recuperar-senha.html`
3. **IMPORTANTE:** Certifique-se que está usando `{{ .ConfirmationURL }}` no template
4. Clique em **Save**

### B. Template de "Confirm Signup" (Confirmar Cadastro)

1. Selecione **"Confirm Signup"** na lista
2. Cole o conteúdo do arquivo `confirmar-usuario.html`
3. **IMPORTANTE:** Certifique-se que está usando `{{ .ConfirmationURL }}` no template
4. Clique em **Save**

## 3. Testar o Fluxo

### Teste de Recuperação de Senha:

1. No app, vá para "Esqueci minha senha"
2. Digite seu email
3. Verifique o email recebido
4. Clique no botão "Redefinir Senha"
5. Deve abrir a página `/reset-password` com o formulário de nova senha
6. Digite a nova senha e confirme

### Teste de Confirmação de Cadastro:

1. Crie uma nova conta no app
2. Verifique o email recebido
3. Clique no botão "Confirmar Email"
4. Deve abrir a página principal já autenticado

## 4. Troubleshooting

### Problema: Link redireciona para página inicial

**Causa:** URL de redirecionamento não está configurada no Supabase

**Solução:**
1. Vá em Authentication → URL Configuration
2. Adicione `https://xara-roan.vercel.app/reset-password` nas Redirect URLs
3. Salve e teste novamente

### Problema: "Invalid link" ou "Link expirado"

**Causa:** Tokens inválidos ou link usado mais de uma vez

**Solução:**
- Links de reset só podem ser usados uma vez
- Solicite um novo link de recuperação de senha
- Links expiram em 24 horas (padrão do Supabase)

### Problema: Email não chega

**Soluções:**
1. Verifique a pasta de spam
2. Confirme que o email está correto
3. Verifique se o SMTP do Supabase está configurado (projetos free usam SMTP compartilhado)
4. Para produção, configure seu próprio SMTP em Authentication → Settings

## 5. Configuração de SMTP Próprio (Opcional - Recomendado para Produção)

Para melhor entregabilidade dos emails:

### Acesse: Authentication → Settings → SMTP Settings

Configure com seu provedor (ex: SendGrid, AWS SES, Postmark):

```
SMTP Host: seu-smtp-host.com
SMTP Port: 587
SMTP User: seu-usuario
SMTP Password: sua-senha
Sender Email: noreply@xara.com.br
Sender Name: Xará
```

## 6. Variáveis de Ambiente

O app já está configurado para usar:

```
EXPO_PUBLIC_WEB_ORIGIN=https://xara-roan.vercel.app
```

Esta variável é usada para construir a URL de redirecionamento:
- Reset Password: `${EXPO_PUBLIC_WEB_ORIGIN}/reset-password`
- Confirm Signup: `${EXPO_PUBLIC_WEB_ORIGIN}/auth-callback`

## 7. Como Funciona Tecnicamente

### Fluxo de Reset de Senha:

1. Usuário clica em "Esqueci minha senha"
2. App chama `supabase.auth.resetPasswordForEmail(email, { redirectTo: 'https://xara-roan.vercel.app/reset-password' })`
3. Supabase envia email com link: `https://xara-roan.vercel.app/reset-password#access_token=XXX&refresh_token=YYY`
4. Página `/reset-password` extrai os tokens do hash da URL
5. Chama `supabase.auth.setSession()` para validar os tokens
6. Usuário define nova senha
7. Chama `supabase.auth.updateUser({ password: novaSenha })`

### Fluxo de Confirmação de Cadastro:

1. Usuário se cadastra
2. Supabase envia email com link de confirmação
3. Usuário clica no link
4. Redireciona para `/auth-callback` que processa a confirmação
5. Usuário fica autenticado automaticamente

## 8. Checklist de Configuração

- [ ] Site URL configurada
- [ ] Redirect URLs adicionadas (`/reset-password` e `/auth-callback`)
- [ ] Template "Reset Password" personalizado
- [ ] Template "Confirm Signup" personalizado
- [ ] URLs dos logos atualizadas nos templates
- [ ] Testado fluxo de reset de senha
- [ ] Testado fluxo de confirmação de cadastro
- [ ] (Opcional) SMTP próprio configurado para produção
