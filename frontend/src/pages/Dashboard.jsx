import { useAuth } from '../contexts/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard
        </h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo de volta, {user?.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Corridas Hoje</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Total de Corridas</h3>
            <p className="text-3xl font-bold text-primary-600">0</p>
          </div>
        </div>

        <div className="card">
          <div className="card-body">
            <h3 className="text-lg font-medium text-gray-900">Avaliação</h3>
            <p className="text-3xl font-bold text-primary-600">-</p>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Atividade Recente</h3>
        </div>
        <div className="card-body">
          <p className="text-gray-600">Nenhuma atividade recente.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 