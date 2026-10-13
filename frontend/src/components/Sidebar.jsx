import React from 'react';
import { 
  LayoutDashboard, 
  GitBranch, 
  Percent, 
  Network, 
  Cpu, 
  Bot, 
  MessageSquare, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

export default function Sidebar({ 
  currentView, 
  setCurrentView, 
  isCollapsed, 
  setIsCollapsed,
  isOpenMobile,
  setIsOpenMobile,
  unresolvedCount,
  handledPercentage
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workflows', label: 'My Workflows', icon: GitBranch, badge: '5 steps' },
    { id: 'risk_analysis', label: 'Risk Analysis', icon: Percent },
    { id: 'failure_map', label: 'Failure Map', icon: Network, highlight: true },
    { id: 'simulations', label: 'Simulations', icon: Cpu, badge: '15 runs' },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, isNew: true },
    { id: 'chat_history', label: 'Chat History', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div 
          onClick={() => setIsOpenMobile(false)}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Main Sidebar */}
      <aside 
        className={`fixed top-16 bottom-0 left-0 z-40 transition-all duration-300 ease-in-out border-r border-navy-700 bg-navy-900/95 backdrop-blur-xl flex flex-col justify-between ${
          isOpenMobile ? 'translate-x-0 w-64' : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
      >
        <div className="p-3 space-y-1 overflow-y-auto">
          {/* Navigation Links */}
          <div className="pt-2 pb-1 px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            {!isCollapsed ? 'Decision Workspace' : 'Menu'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;

            return (
              <button
                key={item.id}
                id={`sidebar-link-${item.id}`}
                onClick={() => {
                  setCurrentView(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/80 text-white shadow-lg shadow-indigo-600/25 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-navy-800'
                }`}
                title={item.label}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                  isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                }`} />

                {!isCollapsed && (
                  <div className="flex-1 flex items-center justify-between text-left overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                        isActive ? 'bg-white/20 text-white' : 'bg-navy-800 text-slate-400 border border-navy-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                    {item.isNew && (
                      <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Sidebar Widget */}
        <div className="p-3 border-t border-navy-700 space-y-3">
          {!isCollapsed && (
            <div className="p-3 rounded-xl bg-navy-800/80 border border-navy-700 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-slate-400 font-medium">Scenario Resiliency</span>
                <span className="font-bold text-slate-200 font-mono">{handledPercentage}%</span>
              </div>
              <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${
                    handledPercentage >= 80 ? 'bg-emerald-500' : handledPercentage >= 45 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${handledPercentage}%` }}
                />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>{unresolvedCount} blockers left</span>
                <button 
                  onClick={() => setCurrentView('simulations')} 
                  className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Test suite
                </button>
              </div>
            </div>
          )}

          {/* Collapse/Expand Toggle on Desktop */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex w-full items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-navy-800 transition-colors"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5" /> : (
              <div className="flex items-center gap-2 text-xs">
                <ChevronLeft className="w-4 h-4" />
                <span>Collapse menu</span>
              </div>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
