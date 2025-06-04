import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Eye, FileText, MessageSquare, Clock, Users, AlertCircle, RefreshCcw } from 'lucide-react';
import { getDashboardStats, getRecentDocuments, getPopularQueries } from '../services';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalDocuments: 0,
    totalQueries: 0,
    averageResponseTime: 0,
    activeUsers: 0,
    documentsByType: {},
    queriesByDay: {},
    storageUsed: 0
  });

  const [queryData, setQueryData] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [popularQueries, setPopularQueries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [statsData, recentDocsData, popularQueriesData] = await Promise.all([
          getDashboardStats(),
          getRecentDocuments(3),
          getPopularQueries(3)
        ]);

        // Update stats
        setStats(statsData);

        // Process query data for the chart
        const queryDataArray = Object.entries(statsData.queriesByDay).map(([date, count]) => ({
          name: new Date(date).toLocaleDateString('fr-FR', { weekday: 'short' }),
          queries: count
        })).slice(-7);
        setQueryData(queryDataArray);

        // Update recent documents
        setRecentDocs(recentDocsData);

        // Update popular queries
        setPopularQueries(popularQueriesData);

      } catch (error) {
        console.error('Erreur lors du chargement des données du tableau de bord', error);
        setError("Impossible de charger les données du tableau de bord");
      } finally {
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
  }    if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
          <div className="flex items-center">
            <AlertCircle className="mr-2" />
            <div>
              <p className="font-bold">Erreur lors du chargement du tableau de bord</p>
              <p className="text-sm">{error}</p>
            </div>
          </div>
          <button 
            className="absolute top-4 right-4 p-1 hover:bg-red-100 rounded-full"
            onClick={() => {
              setError(null);
              fetchDashboardData();
            }}
            title="Réessayer"
          >
            <RefreshCcw size={20} />
          </button>
        </div>
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
                {recentDocs.map((doc) => (
                  <tr key={doc.id} className="border-b border-gray-100">
                    <td className="py-3">{doc.title || doc.original_filename}</td>
                    <td className="py-3">{doc.type?.toUpperCase()}</td>
                    <td className="py-3">{new Date(doc.created_at).toLocaleDateString('fr-FR')}</td>
                    <td className="py-3">
                      <button 
                        className="p-1 hover:bg-gray-100 rounded"
                        onClick={() => window.open(`/documents/${doc.id}`, '_blank')}
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
                {recentDocs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="py-4 text-center text-gray-500">
                      Aucun document récent
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Requêtes populaires</h2>
          <div className="space-y-4">
            {popularQueries.map((item, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{item.query}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {item.count} requête{item.count > 1 ? 's' : ''}
                </p>
              </div>
            ))}
            {popularQueries.length === 0 && (
              <div className="text-center text-gray-500 py-4">
                Aucune requête populaire
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;