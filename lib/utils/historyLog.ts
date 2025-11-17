interface HistoryLogProps {
  entity_id: string;
  entity_type: string;
  action: 'create' | 'update' | 'delete';
  description?: string;
  value: string;
}

export function HistoryLog(data: HistoryLogProps) {
  return {
    entity_id: data.entity_id,
    entity_type: data.entity_type,
    worker_id: '7a073cc5-e8ec-4b8c-8ed4-b2f0d62d2c88', //MARKETING USER
    action: data.action,
    description: data.description || '',
    avatar: null,
    details: [
      {
        filed: 'N/A',
        old_value: 'N/A',
        new_value: data.value,
        type: data.action,
      },
    ],
  };
}
