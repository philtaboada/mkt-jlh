import type { MessageTemplate } from '../types/template';

/**
 * Extrae los placeholders de una plantilla de mensaje
 */
export function extractPlaceholders(
  template: MessageTemplate
): Array<{ index: number; component: 'BODY' | 'HEADER'; label: string }> {
  const placeholders: Array<{ index: number; component: 'BODY' | 'HEADER'; label: string }> = [];

  template.components.forEach((comp) => {
    if ((comp.type === 'BODY' || comp.type === 'HEADER') && comp.text) {
      const matches = comp.text.match(/\{\{(\d+)\}\}/g) || [];
      matches.forEach((match) => {
        const index = parseInt(match.replace(/\{\{|\}\}/g, ''), 10);
        if (!placeholders.find((p) => p.index === index && p.component === comp.type)) {
          placeholders.push({
            index,
            component: comp.type as 'BODY' | 'HEADER',
            label: `${comp.type === 'HEADER' ? 'Encabezado' : 'Cuerpo'} - Parámetro ${index}`,
          });
        }
      });
    }
  });

  return placeholders.sort((a, b) => a.index - b.index);
}

/**
 * Verifica si una plantilla requiere parámetros
 */
export function templateRequiresParams(template: MessageTemplate): boolean {
  return extractPlaceholders(template).length > 0;
}

/**
 * Obtiene una vista previa del texto de la plantilla
 */
export function getTemplatePreview(template: MessageTemplate): string {
  const bodyComponent = template.components.find((c) => c.type === 'BODY');
  if (bodyComponent?.text) {
    return bodyComponent.text.substring(0, 60) + (bodyComponent.text.length > 60 ? '...' : '');
  }
  return template.name;
}

/**
 * Construye el texto completo de la plantilla con parámetros reemplazados
 */
export function buildTemplateText(
  template: MessageTemplate,
  params?: Record<string, string>
): string {
  let templateText = '';

  template.components.forEach((comp) => {
    if (comp.type === 'HEADER' && comp.text) {
      templateText += comp.text + '\n';
    }
    if (comp.type === 'BODY' && comp.text) {
      let bodyText = comp.text;
      if (params) {
        // Reemplazar parámetros {{1}}, {{2}}, etc.
        Object.entries(params).forEach(([key, value]) => {
          const paramIndex = key.replace('param_', '');
          bodyText = bodyText.replace(new RegExp(`\\{\\{${paramIndex}\\}\\}`, 'g'), value);
        });
      }
      templateText += bodyText + '\n';
    }
    if (comp.type === 'FOOTER' && comp.text) {
      templateText += comp.text;
    }
  });

  return templateText.trim();
}

/**
 * Construye un preview del texto de la plantilla con parámetros reemplazados (solo BODY y HEADER)
 */
export function buildTemplatePreview(
  template: MessageTemplate,
  params?: Record<string, string>
): string {
  const bodyComponent = template.components.find((c) => c.type === 'BODY');
  let preview = bodyComponent?.text || '';
  if (bodyComponent) {
    const placeholders = template.components
      .filter((c) => c.type === 'BODY' || c.type === 'HEADER')
      .flatMap((comp) => {
        const matches = comp.text?.match(/\{\{(\d+)\}\}/g) || [];
        return matches.map((match) => {
          const index = parseInt(match.replace(/\{\{|\}\}/g, ''), 10);
          return { index, component: comp.type };
        });
      });
    placeholders.forEach((p) => {
      const value = params?.[`param_${p.index}`] || `{{${p.index}}}`;
      preview = preview.replace(new RegExp(`\\{\\{${p.index}\\}\\}`, 'g'), value);
    });
  }
  return preview;
}
