const RideHistory = () => {
  // Mock data - in real app this would come from API
  const rides = [
    {
      id: 1,
      pickup: 'Rua das Flores, 123',
      destination: 'Avenida Paulista, 1000',
      date: '2024-01-15',
      time: '14:30',
      status: 'completed',
      price: 'R$ 25,00',
      driver: 'João Silva',
    },
    {
      id: 2,
      pickup: 'Shopping Center',
      destination: 'Aeroporto',
      date: '2024-01-10',
      time: '08:15',
      status: 'completed',
      price: 'R$ 45,00',
      driver: 'Maria Santos',
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Concluída';
      case 'cancelled':
        return 'Cancelada';
      case 'in_progress':
        return 'Em andamento';
      default:
        return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Histórico de Corridas</h1>
        <p className="mt-2 text-gray-600">
          Visualize todas as suas corridas anteriores
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          {rides.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Nenhuma corrida encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rides.map((ride) => (
                <div
                  key={ride.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ride.status)}`}>
                          {getStatusText(ride.status)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {ride.date} às {ride.time}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">De:</span>
                          <span className="text-sm text-gray-600">{ride.pickup}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">Para:</span>
                          <span className="text-sm text-gray-600">{ride.destination}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900">Motorista:</span>
                          <span className="text-sm text-gray-600">{ride.driver}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-600">
                        {ride.price}
                      </div>
                      <button className="text-sm text-primary-600 hover:text-primary-500">
                        Ver detalhes
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RideHistory; 