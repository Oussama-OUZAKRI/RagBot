import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, FileText, MessageSquare, Clock, Users } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalQueries: 0,
    averageResponseTime: 0,
    activeUsers: 0
  });

  const [queryData, setQueryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Remplacer par un vrai appel API
        setTimeout(() => {
          setStats({
            totalDocuments: 156,
            totalQueries: 2347,
            averageResponseTime: 1.8,
            activeUsers: 42
          });

          setQueryData([
            { name: 'Lun', queries: 120 },
            { name: 'Mar', queries: 180 },
            { name: 'Mer', queries: 200 },
            { name: 'Jeu', queries: 230 },
            { name: 'Ven', queries: 280 },
            { name: 'Sam', queries: 150 },
            { name: 'Dim', queries: 100 },
          ]);

          setIsLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord', error);
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold mt-1">{value}</h3>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Documents" 
          value={stats.totalDocuments}
          icon={<FileText size={24} className="text-white" />}
          color="bg-blue-500"
        />
        <StatCard 
          title="Requêtes" 
          value={stats.totalQueries}
          icon={<MessageSquare size={24} className="text-white" />}
          color="bg-green-500"
        />
        <StatCard 
          title="Temps moyen (s)" 
          value={stats.averageResponseTime}
          icon={<Clock size={24} className="text-white" />}
          color="bg-yellow-500"
        />
        <StatCard 
          title="Utilisateurs actifs" 
          value={stats.activeUsers}
          icon={<Users size={24} className="text-white" />}
          color="bg-purple-500"
        />
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">Activité des requêtes (7 derniers jours)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={queryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="queries" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Documents récents</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="pb-3">Nom</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-100">
                  <td className="py-3">Documentation produit</td>
                  <td className="py-3">PDF</td>
                  <td className="py-3">05/05/25</td>
                  <td className="py-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3">Rapport annuel</td>
                  <td className="py-3">DOCX</td>
                  <td className="py-3">04/05/25</td>
                  <td className="py-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-3">Procédures internes</td>
                  <td className="py-3">PDF</td>
                  <td className="py-3">03/05/25</td>
                  <td className="py-3">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Requêtes populaires</h2>
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Comment fonctionne le système de facturation ?</p>
              <p className="text-sm text-gray-500 mt-1">27 requêtes</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Quelles sont les étapes pour créer un nouveau compte ?</p>
              <p className="text-sm text-gray-500 mt-1">19 requêtes</p>
            </div>
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium">Comment accéder aux rapports financiers ?</p>
              <p className="text-sm text-gray-500 mt-1">15 requêtes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;