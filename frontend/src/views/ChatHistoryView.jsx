import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Trash2, 
  ArrowRight, 
  Plus, 
  Clock, 
  Sparkles,
  Bot,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';

export default function ChatHistoryView({ onOpenConversation, onNewConversation }) {
  const [conversations, setConversations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const list = await api.listConversations();
      setConversations(list);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      setError('Could not load conversation history from the backend.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    try {
      const success = await api.deleteConversation(id);
      if (success) {
        setConversations(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return 'Recent';
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch (_) {
      return 'Recent';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="pb-4 border-b border-navy-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-white tracking-tight">Chat History & Investigations</h1>
            <span className="text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded border border-indigo-500/30">
              Audit Logs
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Persisted conversation sessions from PLANB Copilot. Real user history only.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchConversations}
            disabled={isLoading}
            className="p-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-300 hover:text-white transition-colors"
            title="Refresh History"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={onNewConversation}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all self-start"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Conversation</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Conversations List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="p-8 rounded-2xl glass-panel text-center text-xs text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 text-indigo-400 animate-spin mx-auto" />
            <p>Loading saved investigations from database...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="p-10 rounded-2xl glass-panel text-center text-xs text-slate-400 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-navy-800/80 border border-navy-700 flex items-center justify-center text-slate-400 mx-auto">
              <MessageSquare className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-300">No saved conversations yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Ask PLANB Copilot a question about your workflow or stress test results to record an auditable investigation.
              </p>
            </div>
            <button
              onClick={onNewConversation}
              className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Start Investigation</span>
            </button>
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              className="p-5 rounded-2xl glass-panel border border-navy-700/80 hover:border-indigo-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
            >
              <div className="space-y-1.5 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {conv.workflowName || 'Workflow Audit'}
                  </span>
                  <span className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(conv.updatedAt || conv.createdAt)}</span>
                  </span>
                  {conv.messageCount > 0 && (
                    <span className="text-[10px] font-mono text-slate-400 bg-navy-800 px-1.5 py-0.5 rounded border border-navy-700">
                      {conv.messageCount} msg{conv.messageCount > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {conv.title}
                </h3>
                {conv.snippet && (
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {conv.snippet}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center">
                <button
                  onClick={() => onOpenConversation(conv.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <span>Reopen</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => handleDelete(conv.id, e)}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-navy-800 transition-colors"
                  title="Delete conversation"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
