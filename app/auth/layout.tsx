export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-zinc-900 dark:via-zinc-950 dark:to-primary/10">
      <div className="w-full max-w-lg md:max-w-3xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-0 flex flex-col md:flex-row overflow-hidden animate-fade-in items-center justify-center h-full md:h-[500px]">
        {/* Columna izquierda */}
        <div className="w-full md:w-1/2 h-full md:h-full flex flex-col justify-center items-center bg-primary/80 dark:bg-primary/60 text-white px-6 py-10 md:px-8 md:py-12">
          <div className="flex flex-col justify-center items-center gap-6 h-full md:h-full w-full">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-bolt h-12 w-12 text-primary drop-shadow mb-2"
            >
              <polygon points="13 2 2 22 17 22 11 13 22 13" />
            </svg>
            <div className="text-center w-full">
              <div className="font-bold text-2xl tracking-tight mb-2">Marketing JLH</div>
              <div className="text-base opacity-90 mb-2">Impulsando tu negocio con tecnología</div>
              <div className="text-xs opacity-70">Soluciones creativas, resultados reales.</div>
            </div>
          </div>
        </div>
        {/* Columna derecha */}
        <div className="w-full md:w-1/2 flex flex-col items-start md:items-center justify-center py-6 md:py-0">
          <div className="w-full max-w-md flex items-start md:items-center justify-center">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
