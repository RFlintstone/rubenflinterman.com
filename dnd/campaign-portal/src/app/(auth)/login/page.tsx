'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Users, Lock, Mail, Key } from 'lucide-react';
import { useUser } from '@/lib/UserContext';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useUser();

  // State for form fields
  const [role, setRole] = useState<'admin' | 'player'>('player');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Here you would normally validate credentials against your DB
    console.log(`Logging in as ${role}:`, { email, password });

    login(role);
    router.push('/');
  };

  return (
      <div className="min-h-screen bg-[#0a0c10] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative">
          <div className="text-center">
            <div className="bg-amber-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-serif text-white mb-2 tracking-tight">Campaign Portal</h1>

            {/* Role Switcher */}
            <div className="flex bg-slate-800 p-1 rounded-xl mb-8 mt-6">
              <button
                  onClick={() => setRole('player')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'player' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'}`}
              >
                Player
              </button>
              <button
                  onClick={() => setRole('admin')}
                  className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${role === 'admin' ? 'bg-amber-600 text-white shadow' : 'text-slate-400'}`}
              >
                DM
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="name@adventure.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Password</label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-amber-500 outline-none transition-all"
                      placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                  type="submit"
                  className={`w-full py-4 rounded-xl font-bold mt-4 transition-all shadow-lg flex items-center justify-center space-x-2 ${
                      role === 'admin' ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-slate-700 hover:bg-slate-600 text-white'
                  }`}
              >
                {role === 'admin' ? <Lock size={18} /> : <Users size={18} />}
                <span>Enter World as {role === 'admin' ? 'DM' : 'Player'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
  );
}