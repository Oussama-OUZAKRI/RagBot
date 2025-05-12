import { User, Lock, Edit, Trash, UserCheck } from 'lucide-react';

export const AdminUsersTable = ({ 
  users, 
  onAddUser, 
  onDeleteUser, 
  onToggleStatus, 
  onUpdateRole, 
  isLoading 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <h3 className="font-semibold">Gestion des utilisateurs</h3>
        <button
          onClick={onAddUser}
          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
        >
          <UserPlus size={16} className="mr-1" />
          Ajouter
        </button>
      </div>
      
      {isLoading ? (
        <div className="p-8 flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rôle</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernière connexion</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <UserRow 
                  key={user.id}
                  user={user}
                  onDelete={onDeleteUser}
                  onToggleStatus={onToggleStatus}
                  onUpdateRole={onUpdateRole}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const UserRow = ({ user, onDelete, onToggleStatus, onUpdateRole }) => {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
            <User size={16} className="text-gray-600" />
          </div>
          <div className="ml-3">
            <div className="text-sm font-medium text-gray-900">{user.username}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
      <td className="px-6 py-4">
        <select
          value={user.role}
          onChange={(e) => onUpdateRole(user.id, e.target.value)}
          className={`text-xs font-semibold rounded p-1 ${
            user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
            user.role === 'editor' ? 'bg-blue-100 text-blue-800' :
            'bg-green-100 text-green-800'
          }`}
        >
          <option value="user">Utilisateur</option>
          <option value="editor">Éditeur</option>
          <option value="admin">Administrateur</option>
        </select>
      </td>
      <td className="px-6 py-4 text-sm text-gray-500">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'Jamais connecté'}
      </td>
      <td className="px-6 py-4">
        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
          user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {user.status === 'active' ? 'Actif' : 'Inactif'}
        </span>
      </td>
      <td className="px-6 py-4 text-sm font-medium">
        <div className="flex space-x-2">
          <button
            onClick={() => onToggleStatus(user.id)}
            className={`p-1 rounded ${
              user.status === 'active' ? 'text-red-600 hover:bg-red-50' : 'text-green-600 hover:bg-green-50'
            }`}
          >
            {user.status === 'active' ? <Lock size={16} /> : <UserCheck size={16} />}
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-1 rounded text-red-600 hover:bg-red-50"
          >
            <Trash size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}