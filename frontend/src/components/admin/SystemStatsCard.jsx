import { Cpu, MemoryStick, HardDrive, BarChart2, Database } from 'lucide-react';

export const SystemStatsCard = ({ 
  cpu, 
  memory, 
  storage, 
  requests, 
  responseTime, 
  dbSize, 
  records 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-100 p-6">
      <h3 className="font-semibold mb-4 flex items-center">
        <BarChart2 className="mr-2" size={18} />
        État du système
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatItem 
          icon={<Cpu size={18} />}
          label="CPU"
          value={cpu}
          max={100}
          color="blue"
        />
        <StatItem 
          icon={<MemoryStick size={18} />}
          label="Mémoire"
          value={memory}
          max={100}
          color="green"
        />
        <StatItem 
          icon={<HardDrive size={18} />}
          label="Stockage"
          value={storage}
          max={100}
          color="yellow"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
        <SimpleStat 
          icon={<BarChart2 size={18} />}
          label="Requêtes traitées"
          value={requests}
        />
        <SimpleStat 
          icon={<BarChart2 size={18} />}
          label="Temps de réponse moyen"
          value={`${responseTime}s`}
        />
        <SimpleStat 
          icon={<Database size={18} />}
          label="Taille DB vectorielle"
          value={dbSize}
        />
        <SimpleStat 
          icon={<Database size={18} />}
          label="Enregistrements vecteurs"
          value={records.toLocaleString()}
        />
      </div>
    </div>
  );
}

function StatItem({ icon, label, value, max, color }) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div>
      <div className="flex items-center text-sm text-gray-500 mb-1">
        <span className="mr-2">{icon}</span>
        {label}
      </div>
      <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${colorClasses[color]}`} 
          style={{ width: `${value}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">{value}%</span>
        <span className="text-xs text-gray-500">{max}%</span>
      </div>
    </div>
  );
}

function SimpleStat({ icon, label, value }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <div className="flex items-center text-sm text-gray-500">
        <span className="mr-2">{icon}</span>
        {label}
      </div>
      <p className="text-2xl font-semibold mt-1">{value}</p>
    </div>
  );
}