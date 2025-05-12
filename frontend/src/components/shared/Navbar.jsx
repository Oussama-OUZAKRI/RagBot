import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut } from 'lucide-react'
import { logout, getCurrentUser } from '../../services/auth'

export const Navbar = ({ setAuthenticated }) => {
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser()
      setUser(userData)
    }
    
    fetchUser()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = async () => {
    await logout()
    setAuthenticated(false)
    navigate('/login')
  }

  const menuItems = [
    {
      label: <span>Profil</span>,
      icon: <User className='w-5' />,
      onClick: (e) => { e.preventDefault(); navigate('/profile'); }
    },
    {
      label: <span>Paramètres</span>,
      icon: <Settings className='w-5' />,
      onClick: (e) => { e.preventDefault(); navigate('/settings'); }
    },
    {
      label: <span className='text-red-600'>Se déconnecter</span>,
      icon: <LogOut className='text-red-600 w-5' />,
      onClick: (e) => { e.preventDefault(); handleLogout(); }
    }
  ];

  return (
    <nav className="bg-white border-b border-gray-200 z-30">
      <div className="px-4 mx-auto max-w-full">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-blue-600">RAG-Automate</span>
            </div>
          </div>
          
          <div className="flex items-center ml-4">
            <div className="relative ml-3" ref={dropdownRef}>
              <div>
                <button
                  type="button"
                  className="flex items-center max-w-xs text-sm bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 hover:cursor-pointer hover:scale-105 transition-transform duration-200"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <span className="sr-only">Ouvrir le menu utilisateur</span>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-500 text-white">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                </button>
              </div>
              
              {dropdownOpen && (
                <div className="absolute right-0 w-48 py-1 mt-2 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b">
                    <p className="font-medium">{user?.name || 'Utilisateur'}</p>
                    <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
                  </div>
                  {menuItems.map((item, index) => (
                    <a
                      key={index}
                      href="#"
                      className="flex items-center px-4 py-2 gap-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={item.onClick}
                    >
                      {item.icon}
                      {item.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
