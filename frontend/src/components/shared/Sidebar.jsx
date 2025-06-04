import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Files, BotMessageSquare, UserCog, PanelRightOpen, PanelLeftOpen } from 'lucide-react';
import { checkSystemHealth } from '../../services/health';

export const Sidebar = ({ userRole }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [healthStatus, setHealthStatus] = useState({
    api: false,
    chromadb: false
  })

  const navigation = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <House /> },
    { name: 'Documents', path: '/documents', icon: <Files /> },
    { name: 'Chat RAG', path: '/chat', icon: <BotMessageSquare /> },
  ]

  if (userRole === 'admin') {
    navigation.push({ name: 'Administration', path: '/admin', icon: <UserCog /> });
  }

  // Check system health every 30 seconds
  useEffect(() => {
    const checkHealth = async () => {
      const status = await checkSystemHealth();
      setHealthStatus(status);
    };

    // Initial check
    checkHealth();

    // Set up interval for periodic checks
    const interval = setInterval(checkHealth, 30000);

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`relative bg-gray-800 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>
      <div className="flex justify-center items-center p-4 h-16 gap-8">
        {!collapsed && <h1 className="text-xl font-bold">RAG-Automate</h1>}
        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-full hover:bg-gray-700 focus:outline-none hover:cursor-pointer"
        >
          {collapsed ? (
            <PanelLeftOpen />
          ) : (
            <PanelRightOpen />
          )}
        </button>
      </div>
      
      <nav className="mt-5 px-2">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                } ${ collapsed &&' justify-center' } group flex items-center gap-4 px-2 py-2 text-base font-medium rounded-md transition-colors duration-200`}
              >
                {item.icon}
                {!collapsed && item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {!collapsed && (
        <div className="absolute bottom-0 w-full p-4">
          <div className="bg-gray-700 rounded-lg p-3 text-xs text-gray-300">
            <p className="font-medium">Statut du système</p>
            <div className="flex items-center mt-2">
              <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.api ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Connecté à l'API</span>
            </div>
            <div className="flex items-center mt-1">
              <div className={`w-3 h-3 rounded-full mr-2 ${healthStatus.chromadb ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>Base vectorielle</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
