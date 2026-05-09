"use client";

import { useState } from "react";
import { Plus, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VehicleCard } from "@/components/VehicleCard";
import { EmptyState } from "@/components/EmptyState";
import { CheckInModal } from "@/components/CheckInModal";
import { CheckOutModal } from "@/components/CheckOutModal";

interface DashboardClientProps {
  vehicles: any[];
  tenantId: string;
}

export function DashboardClient({ vehicles, tenantId }: DashboardClientProps) {
  const [checkInOpen, setCheckInOpen] = useState(false);
  const [checkOutOpen, setCheckOutOpen] = useState(false);
  const [selectedPlaca, setSelectedPlaca] = useState("");

  const handleVehicleClick = (placa: string) => {
    setSelectedPlaca(placa);
    setCheckOutOpen(true);
  };

  return (
    <>
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <Button
            size="lg"
            className="flex-1 h-14 text-lg font-bold"
            onClick={() => setCheckInOpen(true)}
          >
            <Plus className="mr-2 h-6 w-6" />
            Registrar Ingreso
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 h-14 text-lg font-bold"
            onClick={() => {
              setSelectedPlaca("");
              setCheckOutOpen(true);
            }}
          >
            <LogOut className="mr-2 h-6 w-6" />
            Registrar Salida
          </Button>
        </div>

        {/* Vehicles Grid */}
        {vehicles.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((record) => (
              <VehicleCard
                key={record.id}
                vehicle={record}
                onClick={() => handleVehicleClick(record.vehicle.placa)}
              />
            ))}
          </div>
        )}
      </main>

      <CheckInModal 
        open={checkInOpen} 
        onOpenChange={setCheckInOpen} 
        tenantId={tenantId} 
      />
      
      <CheckOutModal 
        open={checkOutOpen} 
        onOpenChange={setCheckOutOpen} 
        tenantId={tenantId}
        initialPlaca={selectedPlaca}
      />
    </>
  );
}
