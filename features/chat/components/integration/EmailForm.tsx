import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function EmailForm() {
  return (
    <form className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-700 dark:text-gray-200 flex items-center gap-2">
          <Mail size={22} className="text-gray-700 dark:text-gray-200" /> Integración Email SMTP
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Configura tu servidor de correo para enviar y recibir emails desde el panel centralizado.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-gray-300 dark:border-gray-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-gray-700 dark:text-gray-200">Credenciales</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Correo electrónico</label>
            <Input type="email" placeholder="correo@ejemplo.com" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Servidor SMTP</label>
            <Input type="text" placeholder="smtp.ejemplo.com" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-700 dark:text-gray-200">Contraseña</label>
            <Input type="password" placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg">
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
