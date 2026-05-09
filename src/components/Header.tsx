import { RefreshCw, Car } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  vehicleCount: number;
  tenantName: string;
}

export const Header = ({ vehicleCount, tenantName }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">ParkMate</h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{tenantName}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Vehículos</span>
            <span className="text-sm font-bold">{vehicleCount} parqueados</span>
          </div>
        </div>
      </div>
    </header>
  );
};
