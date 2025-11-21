import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone } from "lucide-react";

export default function WhatsAppForm() {
  return (
    <form className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-green-700 dark:text-green-400 flex items-center gap-2">
          <Smartphone size={22} className="text-green-700 dark:text-green-400" /> Integración WhatsApp
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Aquí podrás conectar WhatsApp Business API o un proveedor externo.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-green-200 dark:border-green-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-green-700 dark:text-green-400">Credenciales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Número telefónico</label>
            <Input type="text" placeholder="+1 555 123 456" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-green-700 dark:text-green-400">Token</label>
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
