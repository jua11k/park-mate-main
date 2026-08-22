"use client";

import { useState } from 'react';
import { RefreshCw, Car, LayoutDashboard, Calendar, Settings, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { logoutAction } from '@/actions/auth-actions';
import { useRouter } from 'next/navigation';

interface HeaderProps {
  vehicleCount: number;
  tenantName: string;
  tenantSlug?: string;
}

export const Header = ({ vehicleCount, tenantName }: HeaderProps) => {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutAction();
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
              <Car className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">ParkMate</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{tenantName}</p>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" asChild className="rounded-full gap-2 font-semibold">
              <Link href="/dashboard">
                <LayoutDashboard className="h-4 w-4" />
                Panel
              </Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full gap-2 font-semibold">
              <Link href="/reports">
                <RefreshCw className="h-4 w-4" />
                Reportes
              </Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full gap-2 font-semibold">
              <Link href="/customers">
                <Car className="h-4 w-4" />
                Clientes
              </Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full gap-2 font-semibold">
              <Link href="/memberships">
                <Calendar className="h-4 w-4" />
                Convenios
              </Link>
            </Button>
            <Button variant="ghost" asChild className="rounded-full gap-2 font-semibold">
              <Link href="/plans">
                <Settings className="h-4 w-4" />
                Tarifas
              </Link>
            </Button>
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end pr-4 border-r hidden sm:flex">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">Ocupación</span>
            <span className="text-sm font-black">{vehicleCount} Vehículos</span>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-destructive transition-colors hidden md:flex" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>

          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden" 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-2 absolute w-full shadow-lg shadow-black/5">
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/dashboard">
              <LayoutDashboard className="h-4 w-4" />
              Panel
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/reports">
              <RefreshCw className="h-4 w-4" />
              Reportes
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/customers">
              <Car className="h-4 w-4" />
              Clientes
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/memberships">
              <Calendar className="h-4 w-4" />
              Convenios
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full justify-start gap-2 font-semibold" onClick={() => setIsMobileMenuOpen(false)}>
            <Link href="/plans">
              <Settings className="h-4 w-4" />
              Tarifas
            </Link>
          </Button>
          <Button variant="ghost" className="w-full justify-start gap-2 font-semibold text-destructive hover:text-destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Cerrar Sesión
          </Button>
        </div>
      )}
    </header>
  );
};
