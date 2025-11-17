import React from 'react';
import BaseEmail from './BaseEmail';
import { Section, Text, Button } from '@react-email/components';

type Props = {
  name?: string;
  actionUrl?: string;
};

export default function WelcomeEmail({ name, actionUrl }: Props) {
  return (
    <BaseEmail title={`Bienvenido${name ? `, ${name}` : ''}`} preview="Gracias por unirte">
      <Section>
        <Text style={{ fontSize: 16, color: '#0f172a' }}>Hola {name ?? 'amigo'},</Text>

        <Text style={{ marginTop: 12, color: '#334155' }}>
          Gracias por registrarte en nuestra plataforma. Haz click en el siguiente botón para
          comenzar.
        </Text>

        {actionUrl ? (
          <Section style={{ marginTop: 16 }}>
            <a
              href={actionUrl}
              style={{
                display: 'inline-block',
                padding: '10px 16px',
                backgroundColor: '#111827',
                color: '#fff',
                borderRadius: 6,
                textDecoration: 'none',
              }}
            >
              Empezar
            </a>
          </Section>
        ) : null}
      </Section>
    </BaseEmail>
  );
}
