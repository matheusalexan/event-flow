import { useState } from 'react';

const RideRequest = () => {
  const [formData, setFormData] = useState({
    pickup: '',
    destination: '',
    vehicleType: 'standard',
    notes: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Ride request:', formData);
    // TODO: Implement ride request logic
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Solicitar Corrida</h1>
        <p className="mt-2 text-gray-600">
          Informe os detalhes da sua viagem
        </p>
      </div>

      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="pickup" className="block text-sm font-medium text-gray-700">
                Local de partida
              </label>
              <input
                type="text"
                id="pickup"
                name="pickup"
                value={formData.pickup}
                onChange={handleChange}
                className="input mt-1"
                placeholder="Digite o endereço de partida"
                required
              />
            </div>

            <div>
              <label htmlFor="destination" className="block text-sm font-medium text-gray-700">
                Destino
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className="input mt-1"
                placeholder="Digite o endereço de destino"
                required
              />
            </div>

            <div>
              <label htmlFor="vehicleType" className="block text-sm font-medium text-gray-700">
                Tipo de veículo
              </label>
              <select
                id="vehicleType"
                name="vehicleType"
                value={formData.vehicleType}
                onChange={handleChange}
                className="input mt-1"
              >
                <option value="standard">Padrão</option>
                <option value="comfort">Confort</option>
                <option value="premium">Premium</option>
                <option value="van">Van</option>
              </select>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Observações (opcional)
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="input mt-1"
                placeholder="Alguma observação especial?"
              />
            </div>

            <div className="flex justify-end">
              <button type="submit" className="btn btn-primary">
                Solicitar Corrida
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RideRequest; 