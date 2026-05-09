import { Car } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in duration-500">
      <div className="bg-muted rounded-full p-6 mb-4">
        <Car className="h-12 w-12 text-muted-foreground opacity-20" />
      </div>
      <h3 className="text-xl font-bold mb-2">No hay vehículos parqueados</h3>
      <p className="text-muted-foreground max-w-[250px]">
        Registra el ingreso de un vehículo para comenzar la gestión.
      </p>
    </div>
  );
};
