"use client";

import React, { useTransition, useState } from "react";
import { loginAction } from "@/actions/auth-actions";
import { Loader2, Car, Fingerprint, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function LoginPage() {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const formData = new FormData(e.currentTarget);

        startTransition(async () => {
            const result = await loginAction(formData);
            if (result.success && result.redirect) {
                toast.success("Bienvenido de nuevo");
                router.push(result.redirect);
            } else {
                setError(result.error || "Error de autenticación");
                toast.error(result.error || "Algo salió mal");
            }
        });
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent_50%)]" />
            
            <div className="w-full max-w-md relative z-10">
                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="inline-flex h-20 w-20 bg-primary rounded-[2rem] items-center justify-center mb-6 shadow-2xl shadow-primary/20">
                        <Car className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h1 className="text-4xl font-bold text-white tracking-tighter">Acceso ParkMate</h1>
                    <p className="text-white/40 mt-3 font-medium uppercase tracking-widest text-xs">Gestión Privada de Parqueaderos</p>
                </div>

                {/* Card */}
                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] p-8 border border-white/10 shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Correo Electrónico</label>
                                <div className="relative group">
                                    <Fingerprint className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        name="email"
                                        type="email" 
                                        required
                                        placeholder="admin@parkmate.com"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-white/20"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Contraseña</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                                    <input 
                                        name="password"
                                        type="password" 
                                        required
                                        placeholder="••••••••"
                                        className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all text-white placeholder:text-white/20"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={isPending}
                            className="w-full h-16 bg-white text-black font-bold rounded-2xl shadow-xl shadow-white/5 flex items-center justify-center hover:bg-white/90 transition-all disabled:opacity-50 text-lg"
                        >
                            {isPending ? <Loader2 className="h-6 w-6 animate-spin" /> : "Iniciar Sesión"}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
