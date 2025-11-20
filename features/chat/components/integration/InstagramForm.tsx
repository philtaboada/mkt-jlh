import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Instagram } from "lucide-react";

export default function InstagramForm() {
  return (
    <form className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-pink-600 dark:text-pink-400 flex items-center gap-2">
          <Instagram size={22} className="text-pink-600 dark:text-pink-400" />{" "}
          Integración Instagram DM
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm">
          Conecta tu cuenta de Instagram Business para gestionar mensajes directos
          desde el panel.
        </p>
      </div>
      <div className="bg-white dark:bg-background border border-pink-200 dark:border-pink-700 p-6 rounded-lg">
        <h2 className="text-lg font-semibold mb-4 text-pink-600 dark:text-pink-400">
          Credenciales
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-pink-600 dark:text-pink-400">
              Usuario de Instagram
            </label>
            <Input type="text" placeholder="@usuario" required />
          </div>
          <div>
            <label className="block text-sm mb-1 text-pink-600 dark:text-pink-400">
              Token de acceso
            </label>
            <Input type="text" placeholder="TOKEN..." required />
          </div>
          <Button
            type="submit"
            className="w-full bg-primary hover:bg-primary/90 text-white rounded-lg"
          >
            Guardar cambios
          </Button>
        </div>
      </div>
    </form>
  );
}
