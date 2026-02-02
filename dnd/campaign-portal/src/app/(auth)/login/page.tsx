'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Key, Loader2, Lock, Mail, Shield, UserPlus, Users, Phone } from 'lucide-react';
import { useUser } from '@/lib/UserContext';

export default function LoginPage() {
    const router = useRouter();
    const { login } = useUser();

    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        // Ensure API_HOST exists and remove trailing slash if present
        const API_HOST = process.env.NEXT_PUBLIC_API_HOST?.replace(/\/$/, '');

        if (!API_HOST) {
            setError("Configuration Error: API Host is not defined.");
            setIsSubmitting(false);
            return;
        }

        try {
            const endpoint = mode === 'login' ? '/api/v1/token/login' : '/api/v1/auth/register';
            const payload = mode === 'login'
                ? { email, password }
                : { username, email, password, phoneNumber: phoneNumber || undefined };

            const response = await fetch(`${API_HOST}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({}));
                throw new Error(data.message || `${mode === 'login' ? 'Login' : 'Registration'} failed`);
            }

            const data = await response.json();

            // Handle Registration -> Auto-Login sequence
            let token = data.accessToken;
            if (mode === 'register' && !token) {
                const loginRes = await fetch(`${API_HOST}/api/v1/token/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });

                if (loginRes.ok) {
                    const loginData = await loginRes.json();
                    token = loginData.accessToken;
                }
            }

            if (token) {
                // 1. Store the token
                localStorage.setItem('userToken', token);

                // 2. Wait for UserContext to initialize with the new token
                await login();

                // 3. Move the user
                router.replace('/');
            } else if (mode === 'register') {
                // Fallback for registration without auto-login
                setMode('login');
                setError("Account created successfully! Please log in.");
                setIsSubmitting(false);
            } else {
                throw new Error("No access token received from server.");
            }
        } catch (err: any) {
            console.error("Auth Error:", err);
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                <div className="text-center">
                    <div className="bg-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-amber-600/20">
                        <Shield className="text-white" size={32}/>
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2 tracking-tight">Campaign Portal</h1>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm mb-4 animate-pulse">
                            {error}
                        </div>
                    )}

                    <div className="flex bg-slate-800 p-1 rounded-xl mb-8 mt-6">
                        <button
                            type="button"
                            onClick={() => { setMode('login'); setError(null); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-amber-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => { setMode('register'); setError(null); }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'register' ? 'bg-slate-700 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        {mode === 'register' && (
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Username</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                    <input
                                        type="text"
                                        required
                                        value={username}
                                        disabled={isSubmitting}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                        placeholder="adventurer"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email Address</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    disabled={isSubmitting}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                    placeholder="name@adventure.com"
                                />
                            </div>
                        </div>

                        {mode === 'register' && (
                            <div>
                                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Phone Number <span className="text-slate-600">(Optional)</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        disabled={isSubmitting}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                        placeholder="+1 555-0123"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18}/>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    disabled={isSubmitting}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold mt-4 transition-all flex items-center justify-center space-x-2 shadow-lg ${
                                mode === 'register' ? 'bg-amber-600 hover:bg-amber-500' : 'bg-slate-700 hover:bg-slate-600'
                            } text-white disabled:opacity-50`}
                        >
                            {isSubmitting ? (
                                <Loader2 className="animate-spin" size={18}/>
                            ) : (
                                <>
                                    {mode === 'register' ? <UserPlus size={18}/> : <Lock size={18}/>}
                                    <span>{mode === 'register' ? 'Create Account' : 'Enter World'}</span>
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}