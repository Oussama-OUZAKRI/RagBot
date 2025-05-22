import { Settings, ChevronDown, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'

const COOKIE_SETTINGS = 'chat_settings'
const DEFAULT_SETTINGS = {
  numFragments: 3,
  similarityThreshold: 0.7,
  model: 'gpt-4',
  temperature: 0.7
}

export const SettingsPopup = ({ isOpen, onClose, onSave }) => {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS)

  // Charger les paramètres depuis les cookies au montage
  useEffect(() => {
    const savedSettings = Cookies.get(COOKIE_SETTINGS)
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (e) {
        console.error('Erreur lors du chargement des paramètres:', e)
      }
    }
  }, [])

  const handleSave = () => {
    // Sauvegarder dans les cookies
    Cookies.set(COOKIE_SETTINGS, JSON.stringify(settings), { expires: 365 })
    onSave?.(settings)
    onClose()
  }

  const handleChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold flex items-center">
            <Settings size={20} className="mr-2 text-blue-600" />
            Paramètres avancés
          </h3>
          <button 
            className="p-1 rounded-full hover:bg-gray-100"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div>
            <h4 className="font-medium mb-3 text-gray-800">Configuration RAG</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre de fragments à récupérer
                </label>
                <div className="relative">
                  <select 
                    value={settings.numFragments}
                    onChange={(e) => handleChange('numFragments', Number(e.target.value))}
                    className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {[1, 2, 3, 4, 5].map(num => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seuil de similarité ({settings.similarityThreshold})
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={settings.similarityThreshold}
                  onChange={(e) => handleChange('similarityThreshold', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium mb-3 text-gray-800">Modèle LLM</h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modèle
                </label>
                <div className="relative">
                  <select 
                    value={settings.model}
                    onChange={(e) => handleChange('model', e.target.value)}
                    className="w-full appearance-none pl-3 pr-10 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="gpt-4">GPT-4</option>
                    <option value="gpt-3.5">GPT-3.5</option>
                    <option value="claude">Claude</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Température ({settings.temperature})
                </label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={settings.temperature}
                  onChange={(e) => handleChange('temperature', Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0.0</span>
                  <span>0.5</span>
                  <span>1.0</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="pt-4 flex justify-end space-x-3">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
              onClick={onClose}
            >
              Annuler
            </button>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              onClick={handleSave}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
