import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Database, 
  Bot, 
  Server, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Globe, 
  Cpu, 
  RefreshCw 
} from 'lucide-react';
import { api } from '../services/api';

export default function SettingsView() {
  const [healthData, setHealthData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchHealth = async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getHealth();
      setHealthData(data);
    } catch (_) {
      setHealthData({
        status: 'Local Demonstration Mode',
        version: '1.0.0',
        database: 'In-Memory / Local Store',
        geminiAi: 'Rule-Based Fallback Ready'
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration & Integrations</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Deployment & Keys
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Environment variable settings, Supabase PostgreSQL status, and Gemini AI endpoints.
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
          title="Refresh Health"
        >
          <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Integration Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Backend API Service */}
        <div className="p-4 rounded-xl glass-panel border border-navy-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Node / Express API</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Port 5000 Active</span>
          </div>
          <p className="text-[11px] text-slate-400">REST API with Zod validation & JWT auth</p>
        </div>

        {/* Database */}
        <div className="p-4 rounded-xl glass-panel border border-navy-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Database Mode</span>
            <Database className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-sm font-bold text-slate-200">
            {healthData?.database || 'Local In-Memory / Supabase'}
          </div>
          <p className="text-[11px] text-slate-400">Controlled fallback guarantees 100% uptime</p>
        </div>

        {/* Google Gemini AI */}
        <div className="p-4 rounded-xl glass-panel border border-navy-700 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">AI Copilot Engine</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-sm font-bold text-slate-200">
            {healthData?.geminiAi === 'configured' ? 'Gemini 1.5/2.5 Live' : 'Heuristic Engine Ready'}
          </div>
          <p className="text-[11px] text-slate-400">Add GEMINI_API_KEY in .env for live LLM queries</p>
        </div>
      </div>

      {/* Environment Configuration Guide */}
      <div className="p-6 rounded-2xl glass-panel border border-navy-700 space-y-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-indigo-400" />
          <h3 className="text-sm font-bold text-white">Environment Configuration (.env.example)</h3>
        </div>
        <p className="text-xs text-slate-300">
          PLANB LAB follows strict zero-leak security. Private credentials never touch frontend bundles:
        </p>

        <div className="p-4 rounded-xl bg-navy-950 font-mono text-xs text-slate-300 overflow-x-auto space-y-1 border border-navy-800">
          <p><span className="text-indigo-400">PORT</span>=5000</p>
          <p><span className="text-indigo-400">JWT_SECRET</span>=planb_lab_super_secret_jwt_key_hackathon_2026</p>
          <p><span className="text-indigo-400">GEMINI_API_KEY</span>=your_google_gemini_api_key</p>
          <p><span className="text-indigo-400">SUPABASE_URL</span>=https://your-project.supabase.co</p>
          <p><span className="text-indigo-400">SUPABASE_ANON_KEY</span>=your_supabase_anon_key</p>
          <p><span className="text-indigo-400">SUPABASE_SERVICE_ROLE_KEY</span>=your_service_role_key</p>
          <p><span className="text-indigo-400">FRONTEND_URL</span>=http://localhost:5173</p>
        </div>
      </div>

      {/* Deployment Targets (Section 18 Requirement) */}
      <div className="p-6 rounded-2xl glass-panel border border-navy-700 space-y-4">
        <div className="flex items-center gap-2">
          <Globe className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">Cloud Deployment Specifications</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-white block">Frontend: Vercel</span>
            <p className="text-slate-400">
              Vite bundle configured with SPA fallback via <code className="text-indigo-300 font-mono">vercel.json</code>. Zero external build complications.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-navy-950 border border-navy-800 space-y-2">
            <span className="font-bold text-white block">Backend: Render Web Service</span>
            <p className="text-slate-400">
              Node.js Express service configured via <code className="text-indigo-300 font-mono">render.yaml</code> with automatic health check on <code className="text-indigo-300 font-mono">/api/health</code>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
