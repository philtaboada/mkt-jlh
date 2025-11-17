import React from 'react';
import BaseEmail from './BaseEmail';
import { Section, Text } from '@react-email/components';

type Props = {
  title: string;
  body: string;
};

export default function NotificationEmail({ title, body }: Props) {
  return (
    <BaseEmail title={title} preview={title}>
      <Section>
        <Text style={{ fontSize: 16, color: '#0f172a' }}>{body}</Text>
      </Section>
    </BaseEmail>
  );
}
