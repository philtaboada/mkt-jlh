Email components and usage

Files added:

- `components/email/BaseEmail.tsx` — layout wrapper using `@react-email/components`.
- `components/email/WelcomeEmail.tsx` — example welcome template.
- `components/email/NotificationEmail.tsx` — generic notification template.
- `lib/email/resend.ts` — helper to send HTML emails through Resend (uses `RESEND_API_KEY`).

Quick usage example (server-side API route or server action):

1. Render HTML from a React Email component

```ts
import { render } from '@react-email/render';
import WelcomeEmail from '@/components/email/WelcomeEmail';
import { sendEmail } from '@/lib/email/resend';

const html = render(<WelcomeEmail name="Juan" actionUrl="https://example.com/start" />);

await sendEmail({
  to: 'juan@example.com',
  subject: 'Bienvenido a la plataforma',
  html,
});
```

2. Env var

Set `RESEND_API_KEY` en tu entorno (ej. `.env.local`):

RESEND*API_KEY=re*...YOUR_KEY...

Notas:

- Si prefieres usar la SDK oficial de Resend, instala `npm i resend` y reemplaza la implementación en `lib/email/resend.ts`.
- Estas plantillas son minimalistas y pensadas para ser extendidas; separa estilos y componentes si necesitas personalización avanzada.
