import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Car, Shield, Zap, ArrowRight } from "lucide-react";
import { getSession } from "@/actions/auth-actions";
import { redirect } from "next/navigation";

export default async function LandingPage() {
  const session = await getSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white selection:bg-primary/30">
      {/* Navigation */}
      <header className="px-4 lg:px-6 h-20 flex items-center border-b border-white/5 backdrop-blur-md sticky top-0 z-50">
        <Link className="flex items-center justify-center gap-2" href="#">
          <div className="h-10 w-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <Car className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tighter">ParkMate</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-8 items-center">
          <Link className="text-sm font-medium hover:text-primary transition-colors opacity-70 hover:opacity-100" href="/login">
            Ingresar
          </Link>
          <Button asChild className="rounded-full font-bold px-6 bg-white text-black hover:bg-white/90 shadow-xl shadow-white/5">
            <Link href="/login">Empezar ahora</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black z-10" />
             <img 
               src="/parkmate_hero.png" 
               alt="Parking Garage" 
               className="w-full h-full object-cover opacity-50 scale-105" 
             />
          </div>

          <div className="container relative z-20 mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-8 text-center">
              <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-primary backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-1000">
                <Zap className="mr-2 h-4 w-4" />
                <span>Gestión Privada y Segura</span>
              </div>
              
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl/none max-w-4xl bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
                Control Total para tu Parqueadero
              </h1>
              
              <p className="mx-auto max-w-[700px] text-white/60 md:text-xl/relaxed lg:text-2xl/relaxed font-light">
                Optimiza tus ingresos, controla el flujo de vehículos y automatiza tus reportes con la plataforma SaaS de gestión interna más avanzada.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-4">
                <Button size="lg" className="h-14 px-10 rounded-full text-lg font-bold shadow-2xl shadow-primary/40 group" asChild>
                  <Link href="/login">
                    Acceder al Panel
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="w-full py-24 bg-black">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-12 lg:grid-cols-3">
              <div className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Ingreso Ultrarrápido</h3>
                <p className="text-white/60 leading-relaxed">
                  Registra entradas en segundos con nuestra interfaz optimizada para operadores de campo.
                </p>
              </div>
              <div className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Acceso Restringido</h3>
                <p className="text-white/60 leading-relaxed">
                  Sistema cerrado y seguro. Solo personal autorizado puede gestionar la información de tu parqueadero.
                </p>
              </div>
              <div className="group p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:border-primary/50 transition-all duration-500 hover:-translate-y-2">
                <div className="h-14 w-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Car className="h-7 w-7 text-primary" />
                </div>
                <h3 className="text-2xl font-bold mb-4">Control de Convenios</h3>
                <p className="text-white/60 leading-relaxed">
                  Administra planes mensuales y trimestrales con alertas de vencimiento automáticas.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-12 border-t border-white/5 text-center text-white/40 text-sm">
        <p>© 2026 ParkMate Private Edition. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
