import { useState, useEffect } from 'react';
import { User, Server, Settings } from 'lucide-react';
import { 
  AdminUsersTable,
  SystemStatsCard, 
  LLMModelsCard, 
  SystemErrorsCard,
  VectorDBSettings, 
  DocumentProcessingSettings, 
  LLMConfigSettings,
  AddUserModal 
} from '../components';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [systemStats, setSystemStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ 
    username: '', 
    email: '', 
    role: 'user',
    password: '',
    confirmPassword: ''
  });

  // Charger les données initiales
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Simuler un appel API
        setTimeout(() => {
          const mockUsers = [
            { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', lastLogin: '2025-05-04T14:30:00', status: 'active' },
            { id: 2, username: 'jdupont', email: 'jean.dupont@example.com', role: 'user', lastLogin: '2025-05-03T10:15:00', status: 'active' },
            { id: 3, username: 'amartin', email: 'alice.martin@example.com', role: 'user', lastLogin: '2025-05-01T09:45:00', status: 'active' },
            { id: 4, username: 'plegrand', email: 'pierre.legrand@example.com', role: 'editor', lastLogin: '2025-04-28T16:20:00', status: 'inactive' },
          ];
          
          const mockStats = {
            cpu: 32,
            memory: 68,
            storage: 45,
            modelRequests: 1432,
            avgResponseTime: 1.8,
            errors: 2,
            vectorDbSize: '4.2GB',
            vectorRecords: 156734,
            models: [
              { name: 'GPT-4', usage: 756, status: 'active' },
              { name: 'Mistral 7B', usage: 478, status: 'active' },
              { name: 'LLaMA 70B', usage: 198, status: 'active' },
            ],
            vectorDb: {
              type: 'FAISS',
              embedding: 'OpenAI Ada 002',
              dimensions: 1536,
              metric: 'Cosine'
            },
            documentSettings: {
              chunkSize: 500,
              overlap: 50,
              cleanMarkdown: true,
              cleanHTML: true,
              supportedFormats: ['PDF', 'DOCX', 'PPTX', 'TXT', 'MD']
            },
            llmSettings: {
              defaultModel: 'GPT-4',
              defaultChunks: 5,
              defaultTemperature: 0.7,
              maxTokens: 2000
            }
          };
          
          setUsers(mockUsers);
          setSystemStats(mockStats);
          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors du chargement des données admin', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Gestion des utilisateurs
  const handleAddUser = () => {
    if (newUser.password !== newUser.confirmPassword) {
      alert("Les mots de passe ne correspondent pas");
      return;
    }
    
    const newUserId = Math.max(...users.map(u => u.id), 0) + 1;
    const userToAdd = {
      id: newUserId,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      lastLogin: null,
      status: 'active'
    };
    
    setUsers([...users, userToAdd]);
    setIsAddUserModalOpen(false);
    setNewUser({ 
      username: '', 
      email: '', 
      role: 'user',
      password: '',
      confirmPassword: ''
    });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      setUsers(users.filter(user => user.id !== userId));
    }
  };

  const handleToggleUserStatus = (userId) => {
    setUsers(users.map(user => 
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' } 
        : user
    ));
  };

  const handleUpdateUserRole = (userId, newRole) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  // Gestion des paramètres système
  const handleSaveSettings = (settingsType, updatedSettings) => {
    setSystemStats(prev => ({
      ...prev,
      [settingsType]: updatedSettings
    }));
    alert("Paramètres enregistrés avec succès !");
  };

  // Contenu des onglets
  const tabContent = {
    users: (
      <AdminUsersTable 
        users={users}
        onAddUser={() => setIsAddUserModalOpen(true)}
        onDeleteUser={handleDeleteUser}
        onToggleStatus={handleToggleUserStatus}
        onUpdateRole={handleUpdateUserRole}
        isLoading={isLoading}
      />
    ),
    system: (
      <div className="space-y-6">
        <SystemStatsCard 
          cpu={systemStats.cpu}
          memory={systemStats.memory}
          storage={systemStats.storage}
          requests={systemStats.modelRequests}
          responseTime={systemStats.avgResponseTime}
          dbSize={systemStats.vectorDbSize}
          records={systemStats.vectorRecords}
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LLMModelsCard models={systemStats.models} />
          <SystemErrorsCard errorCount={systemStats.errors} />
        </div>
      </div>
    ),
    settings: (
      <div className="space-y-6">
        <VectorDBSettings 
          config={systemStats.vectorDb} 
          onSave={(config) => handleSaveSettings('vectorDb', config)} 
        />
        
        <DocumentProcessingSettings 
          settings={systemStats.documentSettings} 
          onSave={(settings) => handleSaveSettings('documentSettings', settings)} 
        />
        
        <LLMConfigSettings 
          settings={systemStats.llmSettings} 
          onSave={(settings) => handleSaveSettings('llmSettings', settings)} 
        />
      </div>
    )
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Administration</h1>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('users')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="inline mr-2 h-4 w-4" />
              Utilisateurs
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Server className="inline mr-2 h-4 w-4" />
              Système
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'settings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Settings className="inline mr-2 h-4 w-4" />
              Paramètres
            </button>
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          tabContent[activeTab]
        )}
      </main>

      {/* Modal d'ajout d'utilisateur */}
      <AddUserModal 
        isOpen={isAddUserModalOpen}
        onClose={() => setIsAddUserModalOpen(false)}
        newUser={newUser}
        setNewUser={setNewUser}
        onSubmit={handleAddUser}
      />
    </div>
  );
};

export default AdminDashboard;