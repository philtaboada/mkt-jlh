import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from '@react-email/components';

type Props = {
  title?: string;
  preview?: string;
  children: React.ReactNode;
};

export default function BaseEmail({ title, preview, children }: Props) {
  return (
    <Html>
      <Head />
      <Preview>{String(preview ?? title ?? '')}</Preview>
      <Body
        style={{
          backgroundColor: '#f7f7fa',
          fontFamily: 'Arial, sans-serif',
          margin: 0,
          padding: 0,
        }}
      >
        <Section style={{ padding: '24px 0' }}>
          <Container
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 8,
              padding: 20,
              maxWidth: 600,
              margin: '0 auto',
            }}
          >
            {title ? <Heading style={{ fontSize: 20, margin: '0 0 8px' }}>{title}</Heading> : null}
            <Text style={{ color: '#667085', fontSize: 14, margin: '0 0 16px' }}>
              Si no ves correctamente este correo, revisa en un cliente compatible.
            </Text>

            <Section>{children}</Section>

            <Section style={{ marginTop: 20 }}>
              <Text style={{ color: '#94a3b8', fontSize: 12, margin: 0 }}>
                © {new Date().getFullYear()} Tu Empresa
              </Text>
            </Section>
          </Container>
        </Section>
      </Body>
    </Html>
  );
}
