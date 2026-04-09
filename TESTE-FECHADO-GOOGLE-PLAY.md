# Guia: Configurar Teste Fechado no Google Play Console

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter:
- [x] Conta Google Play Console
- [x] AAB pronto: `aab/app-release.aab`
- [x] Package name: `app.oama.xara.android`
- [ ] Lista de emails dos beta testers

---

## 🚀 Passo a Passo Completo

### 1. Criar o App (se ainda não criou)

1. Acesse: https://play.google.com/console
2. Clique em **"Criar app"**
3. Preencha:
   - **Nome do app:** Xará
   - **Idioma padrão:** Português (Brasil)
   - **Tipo:** Aplicativo
   - **Grátis ou pago:** Grátis
4. Aceite os termos e clique em **Criar app**

---

### 2. Preencher Informações Obrigatórias do App

Antes de publicar um teste, você precisa completar:

#### A. **Painel Principal do App**

**Acesse:** Painel → Configuração do app

##### 📱 Detalhes do App

1. Vá em **Detalhes do app**
2. Preencha:

**Ícone do app:**
- Formato: PNG (512 x 512 px)
- Use o arquivo: `assets/icon-borda.png` (redimensione para 512x512)

**Imagem de recursos gráficos:**
- Formato: PNG ou JPG (1024 x 500 px)
- Crie uma imagem com o logo e slogan

**Descrição curta:**
```
Plataforma colaborativa para registro de nomes populares e sinônimos de aves brasileiras
```

**Descrição completa:**
```
O Xará é uma plataforma colaborativa que permite registrar e consultar nomes populares e sinônimos de aves brasileiras.

🔍 BUSCA INTELIGENTE
• Busque espécies por nome popular, vernáculo ou científico
• Descubra variações regionais dos nomes
• Explore a rica diversidade de nomenclaturas

✍️ CONTRIBUA
• Registre nomes populares que você conhece
• Adicione sinônimos regionais
• Ajude a preservar o conhecimento tradicional

🌿 COLABORATIVO
• Plataforma mantida pela comunidade
• Contribuições validadas
• Conhecimento compartilhado

📚 EDUCATIVO
• Aprenda sobre as aves do Brasil
• Descubra curiosidades sobre nomes regionais
• Conecte-se com outros observadores de aves

Contribua com os nomes populares que você conhece e ajude a preservar o conhecimento sobre as aves do Brasil!
```

**Categoria do app:**
- **Categoria:** Educação
- **Subcategoria:** Referência

**Tags (opcional):**
- aves
- natureza
- educação
- brasil

**Email de contato:**
```
contato@xara.com.br
```
(ou seu email pessoal)

**Política de privacidade:**
- Você precisará de uma URL pública
- Pode usar GitHub Pages ou criar uma página simples

##### 📸 Recursos gráficos da ficha

1. Vá em **Recursos gráficos da ficha**
2. Faça upload de:

**Screenshots de smartphone (obrigatório):**
- Mínimo: 2 imagens
- Formato: PNG ou JPG
- Tamanho: 320px a 3840px na menor dimensão
- Proporção: 16:9 ou 9:16

**Screenshots de tablet de 7 polegadas (opcional)**
**Screenshots de tablet de 10 polegadas (opcional)**

**Vídeo do YouTube (opcional):**
- Adicione um vídeo demonstrativo se tiver

##### 🎯 Classificação de conteúdo

1. Vá em **Classificação de conteúdo**
2. Clique em **Iniciar questionário**
3. Preencha:

**Email de contato:** Seu email

**Categoria do app:** Referência/Informação

**Questões sobre conteúdo:**
- Violência: Não
- Conteúdo sexual: Não
- Linguagem inadequada: Não
- Drogas: Não
- etc. (responda tudo como NÃO)

4. Clique em **Salvar** → **Enviar**

##### 👥 Público-alvo e conteúdo

1. Vá em **Público-alvo e conteúdo**
2. Clique em **Iniciar**

**Faixa etária-alvo:**
- Selecione: 18 anos ou mais
- Ou: Todas as idades (se for educativo)

**Conteúdo de apps do Google Play for Families:**
- Não (a menos que queira participar)

**Anúncios:**
- Não (se não tiver anúncios)

3. Salve as configurações

##### 📰 Avisos sobre dados

1. Vá em **Avisos sobre dados**
2. Clique em **Iniciar**

**Seu app coleta ou compartilha dados do usuário?**
- Sim (porque tem cadastro/login)

**Tipos de dados coletados:**
- Informações pessoais → Email
- Atividade do app → Outras ações do usuário (sinônimos registrados)

**Finalidade:**
- Funcionalidade do app
- Autenticação

**Dados são criptografados em trânsito?**
- Sim (Supabase usa HTTPS)

**Usuários podem solicitar exclusão de dados?**
- Sim

4. Revise e publique

##### 🌍 Países e regiões

1. Vá em **Países e regiões**
2. Selecione países onde quer disponibilizar
   - **Recomendado:** Brasil (inicialmente)
   - Ou: Todos os países

---

### 3. Configurar Teste Fechado

Agora que as informações básicas estão completas:

#### A. Criar Faixa de Teste Fechado

1. No menu lateral, vá em **Testes** → **Teste fechado**
2. Clique em **Criar nova versão**

#### B. Criar Lista de Testadores

**Opção 1: Lista de emails**

1. Na seção **Testadores**, clique em **Criar lista de emails**
2. Dê um nome: "Beta Testers - Abril 2026"
3. Cole os emails dos testadores (um por linha):
```
usuario1@gmail.com
usuario2@gmail.com
usuario3@gmail.com
```
4. Clique em **Salvar alterações**
5. Clique em **Adicionar à faixa** para adicionar esta lista ao teste

**Opção 2: Grupos do Google**

1. Crie um Google Group (ex: xara-beta-testers@googlegroups.com)
2. Adicione os testadores ao grupo
3. Na seção **Testadores**, adicione o email do grupo

#### C. Fazer Upload do AAB

1. Na seção **Versões**, clique em **Upload**
2. Selecione o arquivo: `aab/app-release.aab`
3. Aguarde o upload completar
4. O Google vai processar o AAB (~5-10 minutos)

#### D. Preencher Detalhes da Versão

**Nome da versão:**
```
0.1 (Beta)
```

**Notas da versão (português - Brasil):**
```
🎉 Primeira versão beta do Xará!

Esta é uma versão de testes. Estamos ansiosos pelo seu feedback!

Novidades:
• Busca de aves brasileiras por nome popular, vernáculo ou científico
• Registro de nomes populares e sinônimos
• Sistema de autenticação
• Interface otimizada para mobile

⚠️ Dados de teste:
Todos os dados cadastrados nesta fase são de teste e podem ser utilizados para melhorias.

📋 Formulário de feedback será enviado em breve!

Obrigado por participar! 💜
```

#### E. Revisar e Publicar

1. Revise todas as informações
2. Clique em **Salvar**
3. Clique em **Revisar versão**
4. Verifique se não há erros
5. Clique em **Iniciar lançamento para teste fechado**

---

### 4. Configurar Página de Inscrição (Opcional)

Se quiser permitir que pessoas se inscrevam:

1. Em **Teste fechado**, vá em **Gerenciar faixa**
2. Ative **"Criar uma página de inscrição para esta faixa"**
3. Copie o link gerado
4. Compartilhe com potenciais testadores

---

### 5. Obter Link de Convite

Após publicar o teste:

1. Vá em **Teste fechado**
2. Na seção **Gerenciar faixa**, você verá:
   - **Link de inscrição** (se habilitou página de inscrição)
   - **Link de teste** (para testadores já aprovados)

**Link de teste será algo como:**
```
https://play.google.com/apps/testing/app.oama.xara.android
```

---

### 6. Enviar Convites aos Testadores

**Opção A: Email Manual**

Envie o email de boas-vindas (`beta-testers.html`) substituindo a linha:

```html
<p>O link será enviado nas próximas horas.</p>
```

Por:

```html
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
  <tr>
    <td align="center" style="padding: 16px 0;">
      <a href="https://play.google.com/apps/testing/app.oama.xara.android" target="_blank" style="display: inline-block; padding: 14px 32px; background-color: #2E7D32; color: #FFFFFF; text-decoration: none; border-radius: 28px; font-size: 15px; font-weight: 600; box-shadow: 0 2px 8px rgba(46, 125, 50, 0.3);">
        Baixar App Android
      </a>
    </td>
  </tr>
</table>
```

**Opção B: Google Play Console**

O Google pode enviar convites automaticamente para emails na lista

---

## 🔍 Processo de Revisão

**Teste fechado:**
- ⏱️ Tempo de revisão: Normalmente mais rápido que produção (algumas horas a 1 dia)
- 📧 Você receberá email quando for aprovado
- ✅ Testadores podem baixar assim que aprovado

**Importante:**
- Teste fechado tem revisão mais leve
- Você pode atualizar versões de teste mais rapidamente
- Limite de testadores: até 100 em lista de emails

---

## 📱 Instruções para Testadores

Envie estas instruções junto com o link:

```
Como participar do teste:

1. Acesse o link: [LINK DO TESTE]
2. Clique em "Tornar-se um testador"
3. Aguarde alguns minutos
4. Acesse o Google Play Store
5. Procure por "Xará" ou acesse o link novamente
6. Clique em "Instalar"
7. Pronto! O app está instalado

Obs: Pode levar alguns minutos até o app aparecer no Play Store após aceitar o convite.
```

---

## ⚙️ Gerenciar Teste

### Adicionar mais testadores

1. Vá em **Teste fechado** → **Gerenciar faixa**
2. Edite a lista de emails
3. Adicione novos emails
4. Salve

### Criar nova versão de teste

1. Vá em **Teste fechado**
2. Clique em **Criar nova versão**
3. Faça upload do novo AAB
4. Incremente o `versionCode` no `app.json` antes de gerar novo AAB
5. Publique

### Monitorar feedback

1. Vá em **Teste fechado** → **Feedback**
2. Veja relatórios de falhas
3. Leia comentários dos testadores

### Promover para produção

Quando estiver pronto:

1. Vá em **Teste fechado**
2. Selecione a versão
3. Clique em **Promover versão**
4. Escolha **Produção**
5. Revise e publique

---

## ✅ Checklist Final

- [ ] App criado no Google Play Console
- [ ] Informações básicas preenchidas (nome, descrição, categoria)
- [ ] Ícone e screenshots adicionados
- [ ] Classificação de conteúdo completa
- [ ] Público-alvo configurado
- [ ] Política de privacidade configurada
- [ ] Avisos sobre dados preenchidos
- [ ] Teste fechado criado
- [ ] Lista de testadores adicionada
- [ ] AAB enviado com sucesso
- [ ] Notas da versão preenchidas
- [ ] Teste publicado
- [ ] Link de teste obtido
- [ ] Email de convite enviado aos testadores

---

## 🆘 Problemas Comuns

### "Faltam informações obrigatórias"

**Solução:** Verifique se preencheu todas as seções em **Configuração do app**

### "AAB tem erros"

**Solução:** Verifique se o versionCode é maior que versões anteriores

### "Testadores não conseguem ver o app"

**Soluções:**
- Confirme que aceitaram o convite
- Aguarde 10-15 minutos após aceitar
- Peça para limpar cache do Play Store
- Verifique se o email está na lista

### "Revisão está demorando"

**Normal:** Teste fechado normalmente é aprovado em algumas horas, mas pode levar até 2 dias

---

## 📞 Links Úteis

- **Play Console:** https://play.google.com/console
- **Documentação de Testes:** https://support.google.com/googleplay/android-developer/answer/9845334
- **Central de Ajuda:** https://support.google.com/googleplay/android-developer
