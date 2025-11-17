'use client';

import React from 'react';

type Props = {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
  titleClassName?: string;
  subtitleClassName?: string;
  actionsClassName?: string;
};

export default function HeaderDetail({
  title,
  subtitle,
  actions,
  className = '',
  children,
  titleClassName = '',
  subtitleClassName = '',
  actionsClassName = '',
}: Props) {
  return (
    <div className={`flex items-center justify-between mb-4 ${className}`}>
      <div>
        {title && (
          <h1 className={`text-3xl font-bold tracking-tight ${titleClassName}`}>{title}</h1>
        )}
        {subtitle && (
          <p className={`text-sm text-muted-foreground ${subtitleClassName}`}>{subtitle}</p>
        )}
      </div>

      <div className={`flex items-center gap-2 ${actionsClassName}`}>
        {actions}
        {children}
      </div>
    </div>
  );
}
