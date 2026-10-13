import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import ContextPanel from './components/ContextPanel';
import CopilotDrawer from './components/CopilotDrawer';
import ApplyFixRetestModal from './components/ApplyFixRetestModal';
import AuthModal from './components/AuthModal';

// Views
import LandingView from './views/LandingView';
import DashboardView from './views/DashboardView';
import WorkflowsListView from './views/WorkflowsListView';
import WorkflowBuilderView from './views/WorkflowBuilderView';
import RiskAnalysisView from './views/RiskAnalysisView';
import FailureMapView from './views/FailureMapView';
import SimulationsView from './views/SimulationsView';
import CopilotView from './views/CopilotView';
import ChatHistoryView from './views/ChatHistoryView';
import SettingsView from './views/SettingsView';

import { 
  DEFAULT_WORKFLOW, 
  CONTINGENCIES, 
  FAILURE_MODES, 
  runClientSuite, 
  api 
} from './services/api';

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [workflow, setWorkflow] = useState(DEFAULT_WORKFLOW);
  const [selectedNode, setSelectedNode] = useState(DEFAULT_WORKFLOW.components[0]);
  
  // Baseline starts with 0 contingencies enabled so users see the realistic failure state
  const [enabledContingencies, setEnabledContingencies] = useState([]);
  // Fault injection state for the Failure Map
  const [activeFailures, setActiveFailures] = useState(['internet_outage']);

  // Modals & Panels
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const [isRetestModalOpen, setIsRetestModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [injectedCopilotQuery, setInjectedCopilotQuery] = useState(null);

  // Simulation Suite state
  const [simulationSuite, setSimulationSuite] = useState(() => runClientSuite({ enabledContingencies: [], workflow: DEFAULT_WORKFLOW }));
  const [retestData, setRetestData] = useState(null);
  const [isRetesting, setIsRetesting] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('planb_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Re-run simulation suite whenever enabled contingencies or workflow changes
  useEffect(() => {
    const suite = runClientSuite({ enabledContingencies, workflow });
    setSimulationSuite(suite);
  }, [enabledContingencies, workflow]);

  // Execute Retest (Baseline vs Retest)
  const handleExecuteRetest = async () => {
    setIsRetesting(true);
    try {
      const result = await api.runRetest({
        baselineContingencies: [],
        retestContingencies: enabledContingencies,
        workflow
      });
      setRetestData(result);
      setIsRetestModalOpen(true);
    } catch (err) {
      console.error('Retest execution error:', err);
    } finally {
      setIsRetesting(false);
    }
  };

  const handleOpenRetestModal = async () => {
    if (!retestData) {
      await handleExecuteRetest();
    } else {
      setIsRetestModalOpen(true);
    }
  };

  // Toggle Contingency
  const toggleContingency = (contId) => {
    setEnabledContingencies(prev => {
      const next = prev.includes(contId)
        ? prev.filter(id => id !== contId)
        : [...prev, contId];
      return next;
    });
  };

  // Toggle Fault Injection
  const toggleFailure = (modeId) => {
    setActiveFailures(prev => {
      const next = prev.includes(modeId)
        ? prev.filter(id => id !== modeId)
        : [...prev, modeId];
      return next;
    });
  };

  // Reset to Baseline
  const handleResetToBaseline = () => {
    setEnabledContingencies([]);
  };

  // Copilot helper
  const handleOpenCopilotWithQuery = (query) => {
    setInjectedCopilotQuery(query);
    setIsCopilotOpen(true);
  };

  // Auth Handlers
  const handleAuthSuccess = ({ token, user }) => {
    localStorage.setItem('planb_token', token);
    localStorage.setItem('planb_user', JSON.stringify(user));
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('planb_token');
    localStorage.removeItem('planb_user');
    setCurrentUser(null);
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        planHealth={simulationSuite.planHealth}
        handledPercentage={simulationSuite.handledPercentage}
        openCopilot={() => setIsCopilotOpen(true)}
        onTriggerRetest={handleOpenRetestModal}
        openAuthModal={() => setIsAuthModalOpen(true)}
        currentUser={currentUser}
        onLogout={handleLogout}
        toggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar (Only visible when not on Landing page) */}
        {currentView !== 'landing' && (
          <Sidebar
            currentView={currentView}
            setCurrentView={setCurrentView}
            isCollapsed={isSidebarCollapsed}
            setIsCollapsed={setIsSidebarCollapsed}
            isOpenMobile={isMobileSidebarOpen}
            setIsOpenMobile={setIsMobileSidebarOpen}
            unresolvedCount={simulationSuite.unresolvedFailureScenarios}
            handledPercentage={simulationSuite.handledPercentage}
          />
        )}

        {/* Center Main Workspace */}
        <main className={`flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300 ${
          currentView !== 'landing' ? (isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64') : ''
        }`}>
          {currentView === 'landing' && (
            <LandingView
              onStartDemo={() => setCurrentView('dashboard')}
              onLoadCustomPlan={() => setCurrentView('dashboard')}
              onSelectSampleWorkflow={() => setCurrentView('dashboard')}
            />
          )}

          {currentView === 'dashboard' && (
            <DashboardView
              workflow={workflow}
              simulationSuite={simulationSuite}
              onNavigate={(view) => setCurrentView(view)}
              onTriggerRetest={handleOpenRetestModal}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {currentView === 'workflows' && (
            <WorkflowsListView
              activeWorkflow={workflow}
              onSelectWorkflow={() => setCurrentView('workflow_builder')}
              onEditInBuilder={() => setCurrentView('workflow_builder')}
              onTriggerRetest={handleOpenRetestModal}
            />
          )}

          {currentView === 'workflow_builder' && (
            <WorkflowBuilderView
              workflow={workflow}
              setWorkflow={setWorkflow}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              onTriggerRetest={handleOpenRetestModal}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {currentView === 'risk_analysis' && (
            <RiskAnalysisView
              workflow={workflow}
              setWorkflow={setWorkflow}
              onTriggerRetest={handleOpenRetestModal}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {currentView === 'failure_map' && (
            <FailureMapView
              workflow={workflow}
              activeFailures={activeFailures}
              toggleFailure={toggleFailure}
              enabledContingencies={enabledContingencies}
              toggleContingency={toggleContingency}
              selectedNode={selectedNode}
              setSelectedNode={setSelectedNode}
              onTriggerRetest={handleOpenRetestModal}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {currentView === 'simulations' && (
            <SimulationsView
              simulationSuite={simulationSuite}
              onTriggerRetest={handleOpenRetestModal}
              enabledContingencies={enabledContingencies}
              toggleContingency={toggleContingency}
              onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
            />
          )}

          {currentView === 'copilot' && (
            <CopilotView
              workflow={workflow}
              simulationSuite={simulationSuite}
              onTriggerRetest={handleOpenRetestModal}
            />
          )}

          {currentView === 'chat_history' && (
            <ChatHistoryView
              onOpenConversationWithPrompt={(prompt) => {
                handleOpenCopilotWithQuery(prompt);
                setCurrentView('copilot');
              }}
            />
          )}

          {currentView === 'settings' && (
            <SettingsView />
          )}
        </main>

        {/* Right Contextual Info Panel (Visible on large screens except landing) */}
        {currentView !== 'landing' && (
          <ContextPanel
            selectedNode={selectedNode}
            enabledContingencies={enabledContingencies}
            toggleContingency={toggleContingency}
            activeFailures={activeFailures}
            toggleFailure={toggleFailure}
            onTriggerRetest={handleOpenRetestModal}
            onOpenCopilotWithQuery={handleOpenCopilotWithQuery}
          />
        )}
      </div>

      {/* Slide-out Collapsible AI Copilot Drawer */}
      <CopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        workflow={workflow}
        simulationSuite={simulationSuite}
        queryToInject={injectedCopilotQuery}
        clearInjectedQuery={() => setInjectedCopilotQuery(null)}
      />

      {/* Prominent "APPLY FIX & RETEST" Before vs After Modal */}
      <ApplyFixRetestModal
        isOpen={isRetestModalOpen}
        onClose={() => setIsRetestModalOpen(false)}
        retestData={retestData}
        isRetesting={isRetesting}
        enabledContingencies={enabledContingencies}
        toggleContingency={toggleContingency}
        onExecuteRetest={handleExecuteRetest}
        onResetToBaseline={handleResetToBaseline}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  );
}
