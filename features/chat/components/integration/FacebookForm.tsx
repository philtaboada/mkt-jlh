import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

export default function FacebookForm() {
  return (
    <form className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <MessageCircle size={22} className="text-blue-700 dark:text-blue-400" /> Integración Facebook Messenger
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Conecta tu página de Facebook para recibir y responder mensajes directamente desde el panel.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-blue-200 dark:border-blue-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-blue-700 dark:text-blue-400">Credenciales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">Página de Facebook</label>
            <Input type="text" placeholder="Nombre o URL de la página" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-blue-700 dark:text-blue-400">Token de acceso</label>
            <Input type="text" placeholder="TOKEN..." required />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg">
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
