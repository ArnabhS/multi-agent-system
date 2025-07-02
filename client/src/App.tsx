import { useState } from 'react';
import { MessageSquare, BarChart3 } from 'lucide-react';
import SupportAgent from './components/SupportAgent';
import DashboardAgent from './components/DashboardAgent';


type TabType = 'support' | 'dashboard' | 'internal';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('support');

  const tabs = [
    { id: 'support', label: 'Support Agent', icon: MessageSquare },
    { id: 'dashboard', label: 'Dashboard Agent', icon: BarChart3 },
    
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'support':
        return <SupportAgent />;
      case 'dashboard':
        return <DashboardAgent />;
      default:
        return <SupportAgent />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-gray-900">
                  Multi-Agent System
                </h1>
              </div>
            </div>
            
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap flex items-center py-4 px-6 border-b-2 font-medium text-sm`}
                  >
                    <Icon className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
