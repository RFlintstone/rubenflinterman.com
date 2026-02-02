'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Eye, EyeOff, Key, Loader2, Lock, Mail, Shield, UserPlus, Users} from 'lucide-react';
import {useUser} from '@/lib/UserContext';

export default function LoginPage() {
    const router = useRouter();
    const {login} = useUser();

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
        setIsSubmitting(true);
        setError(null);

        try {
            if (mode === 'login') {
                // Handle Login
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/token/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password}),
                });

                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const errData = await response.json();
                        throw new Error(errData.message || 'Invalid credentials');
                    } else {
                        const rawText = await response.text();
                        console.error("Server returned non-JSON error:", rawText);
                        throw new Error(`Server Error: ${response.status}`);
                    }
                }

                const contentType = response.headers.get("content-type");
                const data = contentType && contentType.indexOf("application/json") !== -1
                    ? await response.json()
                    : null;

                if (!data) {
                    throw new Error("Empty or invalid JSON response from server");
                }

                // Store the JWT Token
                localStorage.setItem('userToken', data.accessToken);

                // Update Global User State
                login('player');

                // Redirect to Dashboard
                router.push('/');
            } else {
                // Handle Registration
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/auth/register`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username,
                        email,
                        password,
                        phoneNumber: phoneNumber || undefined
                    }),
                });

                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const errData = await response.json();
                        throw new Error(errData.message || errData || 'Registration failed');
                    } else {
                        const rawText = await response.text();
                        console.error("Server returned non-JSON error:", rawText);

                        // Check if it's a conflict error (409)
                        if (response.status === 409) {
                            throw new Error('A user with this email already exists.');
                        }
                        throw new Error(`Server Error: ${response.status}`);
                    }
                }

                const contentType = response.headers.get("content-type");
                const data = contentType && contentType.indexOf("application/json") !== -1
                    ? await response.json()
                    : null;

                if (!data) {
                    throw new Error("Empty or invalid JSON response from server");
                }

                // Registration successful - now log them in automatically
                const loginResponse = await fetch(`${process.env.NEXT_PUBLIC_API_HOST}/api/v1/token/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password}),
                });

                if (loginResponse.ok) {
                    const loginData = await loginResponse.json();
                    localStorage.setItem('userToken', loginData.accessToken);
                    login('player');
                    router.push('/');
                } else {
                    // Registration succeeded but auto-login failed - switch to login mode
                    setError('Registration successful! Please log in.');
                    setMode('login');
                }
            }
        } catch (err: any) {
            if (err.message.toString().toLowerCase().includes("network")) {
                setError(`Looks like we had trouble ${mode === 'login' ? 'logging you in' : 'registering your account'}.\n\nPlease try again later.`);
                return;
            }
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
                <div className="text-center">
                    <div className="bg-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <Shield className="text-white" size={32}/>
                    </div>
                    <h1 className="text-3xl font-serif text-white mb-2 tracking-tight">Campaign Portal</h1>

                    {/* Error Message Display */}
                    {error && (
                        <div
                            className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm mb-4">
                            {error.split("\n").map((line, index) => (
                                <div key={index}>
                                    {line}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Mode Switcher */}
                    <div className="flex bg-slate-800 p-1 rounded-xl mb-8 mt-6">
                        <button
                            type="button"
                            onClick={() => {
                                setMode('login');
                                setError(null);
                            }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'login' ? 'bg-amber-600 text-white shadow' : 'text-slate-400'}`}
                        >
                            Login
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setMode('register');
                                setError(null);
                            }}
                            className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${mode === 'register' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
                        >
                            Register
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        {/* Username field - only for registration */}
                        {mode === 'register' && (
                            <div>
                                <label
                                    className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Username</label>
                                <div className="relative">
                                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                           size={18}/>
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
                            <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email
                                Address</label>
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

                        {/* Phone Number field - only for registration, optional */}
                        {mode === 'register' && (
                            <div>
                                <label
                                    className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">
                                    Phone Number <span className="text-slate-600">(Optional)</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                          size={18}/>
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        disabled={isSubmitting}
                                        onChange={(e) => setPhoneNumber(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="relative group/eye-container">
                            <Key
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                size={18}
                            />

                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                disabled={isSubmitting}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-12 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all disabled:opacity-50"
                                placeholder="••••••••"
                            />

                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center">
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isSubmitting}
                                    className="peer text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus:text-amber-500"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                                </button>

                                {/* The Tooltip */}
                                <span
                                    className="pointer-events-none absolute bottom-full mb-2 whitespace-nowrap rounded bg-slate-700 px-2 py-1 text-[10px] font-medium text-white opacity-0 transition-opacity peer-hover:opacity-100">
                                    {showPassword ? "Hide password" : "Show password"}
                                    {/* Tooltip Arrow */}
                                    <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-700"></span>
                                </span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold mt-4 transition-all shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 ${
                                mode === 'register' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                            }`}
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