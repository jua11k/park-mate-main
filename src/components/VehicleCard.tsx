import { Car, Clock, MapPin, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

interface VehicleCardProps {
  vehicle: any;
  onClick: () => void;
}

export const VehicleCard = ({ vehicle, onClick }: VehicleCardProps) => {
  const entryDate = new Date(vehicle.entryTime);
  const timeAgo = formatDistanceToNow(entryDate, { addSuffix: true, locale: es });

  return (
    <Card 
      className="overflow-hidden transition-all hover:shadow-md active:scale-[0.98] cursor-pointer group"
      onClick={onClick}
    >
      <CardContent className="p-0">
        <div className="flex items-stretch h-24">
          <div className="bg-primary/10 flex items-center justify-center w-20 group-hover:bg-primary/20 transition-colors">
            <Car className="h-8 w-8 text-primary" />
          </div>
          
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold tracking-wider">{vehicle.vehicle.placa}</h3>
                <p className="text-xs text-muted-foreground capitalize">{vehicle.vehicle.tipo}</p>
              </div>
              <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                {vehicle.status === 'parked' ? 'En Parqueo' : vehicle.status}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Ingresó {timeAgo}</span>
              </div>
              <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
