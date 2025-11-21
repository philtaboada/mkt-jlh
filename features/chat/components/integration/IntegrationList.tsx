interface Integration {
  name: string;
  description: string;
  status: 'connected' | 'disconnected';
  href: string;
}

interface IntegrationListProps {
  integrations: readonly Integration[];
}

export function IntegrationList({ integrations }: IntegrationListProps) {
  return (
    <div className="space-y-4">
      {integrations.map((integration) => (
        <div
          key={integration.name}
          className="border rounded-lg p-4 flex items-center justify-between"
        >
          <div>
            <h2 className="text-lg font-semibold">{integration.name}</h2>
            <p className="text-sm text-gray-600">{integration.description}</p>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${
                integration.status === 'connected'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {integration.status === 'connected' ? 'Conectado' : 'Desconectado'}
            </span>
            <a
              href={integration.href}
              className="text-blue-600 hover:underline text-sm"
            >
              Configurar
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
