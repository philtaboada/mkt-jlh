export const metadata = {
  title: 'Bandeja de Entrada del Chat',
};

export default function InboxPage() {
  return (
    <div className="flex-1 flex items-center justify-center bg-card">
      <div className="text-center">
        <p className="text-muted-foreground">Selecciona una conversación para comenzar</p>
      </div>
    </div>
  );
}
