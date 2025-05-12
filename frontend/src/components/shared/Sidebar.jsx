import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { House, Files, BotMessageSquare, UserCog, PanelRightOpen, PanelLeftOpen } from 'lucide-react';

export const Sidebar = ({ userRole }) => {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  /* const navigation = [
    { name: 'Tableau de bord', path: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
    { name: 'Documents', path: '/documents', icon: 'M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { name: 'Chat RAG', path: '/chat', icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z' },
  ] */

  const navigation = [
    { name: 'Tableau de bord', path: '/dashboard', icon: <House /> },
    { name: 'Documents', path: '/documents', icon: <Files /> },
    { name: 'Chat RAG', path: '/chat', icon: <BotMessageSquare /> },
  ]

  if (userRole === 'admin') {
    navigation.push({ name: 'Administration', path: '/admin', icon: <UserCog /> });
  }

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
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Connecté à l'API</span>
            </div>
            <div className="flex items-center mt-1">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span>Base vectorielle</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
