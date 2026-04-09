# Como Enviar Email para Beta Testers via Resend

## 1. Configurar Resend

Instale o pacote Resend:
```bash
npm install resend
```

## 2. Script de Envio

Crie um arquivo `scripts/send-beta-email.ts`:

```typescript
import { Resend } from 'resend';
import * as fs from 'fs';
import * as path from 'path';

const resend = new Resend(process.env.RESEND_API_KEY);

// Lista de beta testers
const betaTesters = [
  { email: 'usuario1@example.com', name: 'Nome 1' },
  { email: 'usuario2@example.com', name: 'Nome 2' },
  // Adicione mais...
];

async function sendBetaEmails() {
  // Ler o template HTML
  const htmlTemplate = fs.readFileSync(
    path.join(__dirname, '../email-templates/beta-testers.html'),
    'utf-8'
  );

  for (const tester of betaTesters) {
    try {
      const { data, error } = await resend.emails.send({
        from: 'Xará <noreply@xara.com.br>', // Substitua pelo seu domínio verificado
        to: [tester.email],
        subject: 'Bem-vindo ao Beta do Xará! 🎉',
        html: htmlTemplate,
      });

      if (error) {
        console.error(`Erro ao enviar para ${tester.email}:`, error);
      } else {
        console.log(`✅ Email enviado para ${tester.email}`);
      }

      // Aguarda 1 segundo entre envios para não sobrecarregar
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Erro ao processar ${tester.email}:`, err);
    }
  }

  console.log('✅ Todos os emails foram processados!');
}

sendBetaEmails();
```

## 3. Configurar Variável de Ambiente

Adicione no seu `.env`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
```

## 4. Executar

```bash
npx tsx scripts/send-beta-email.ts
```

---

## Envio Único (Teste)

Para testar com um único email:

```typescript
import { Resend } from 'resend';
import * as fs from 'fs';

const resend = new Resend('re_your_api_key');

const html = fs.readFileSync('./email-templates/beta-testers.html', 'utf-8');

async function test() {
  const { data, error } = await resend.emails.send({
    from: 'Xará <noreply@xara.com.br>',
    to: ['seu-email@example.com'],
    subject: 'Bem-vindo ao Beta do Xará! 🎉',
    html,
  });

  if (error) {
    console.error(error);
  } else {
    console.log('Email enviado!', data);
  }
}

test();
```

---

## Usando React Email (Alternativa)

Se preferir usar componentes React:

```bash
npm install @react-email/components
```

Crie `emails/BetaTester.tsx`:

```tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

export default function BetaTesterEmail() {
  return (
    <Html lang="pt-BR">
      <Head />
      <Preview>Bem-vindo ao Beta do Xará! 🎉</Preview>
      <Body style={{ backgroundColor: '#FFFBF7', fontFamily: 'Arial, sans-serif' }}>
        <Container style={{ maxWidth: '600px', margin: '40px auto' }}>
          {/* Use o conteúdo do template HTML aqui */}
        </Container>
      </Body>
    </Html>
  );
}
```

E envie com:

```typescript
import { render } from '@react-email/render';
import BetaTesterEmail from './emails/BetaTester';

const html = render(<BetaTesterEmail />);

await resend.emails.send({
  from: 'Xará <noreply@xara.com.br>',
  to: ['user@example.com'],
  subject: 'Bem-vindo ao Beta do Xará! 🎉',
  html,
});
```

---

## Checklist antes de enviar

- [ ] Domínio verificado no Resend
- [ ] Template testado com seu próprio email
- [ ] Lista de beta testers atualizada
- [ ] RESEND_API_KEY configurada
- [ ] Links do email funcionando (app web, logo)
- [ ] Ortografia e gramática revisadas

---

## Links Úteis

- **Resend Docs:** https://resend.com/docs
- **React Email:** https://react.email/
- **Domínios Verificados:** https://resend.com/domains
