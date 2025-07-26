import { Link } from 'react-router-dom';
import { Car, MapPin, Shield, Clock, Star, Users } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-primary-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Transport App</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 font-medium"
              >
                Entrar
              </Link>
              <Link
                to="/register"
                className="btn btn-primary"
              >
                Cadastrar
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-bold text-gray-900 sm:text-5xl md:text-6xl">
              Transporte urbano
              <span className="text-primary-600"> inteligente</span>
            </h2>
            <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto">
              Solicite corridas de forma rápida e segura. Conectamos passageiros e motoristas 
              através de uma plataforma moderna e confiável.
            </p>
            <div className="mt-10 flex justify-center space-x-4">
              <Link
                to="/register"
                className="btn btn-primary text-lg px-8 py-3"
              >
                Começar agora
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary text-lg px-8 py-3"
              >
                Já tenho conta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-3xl font-bold text-gray-900">
              Por que escolher o Transport App?
            </h3>
            <p className="mt-4 text-lg text-gray-600">
              Oferecemos a melhor experiência em transporte urbano
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <Clock className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Rápido</h4>
              <p className="mt-2 text-gray-600">
                Encontre motoristas próximos em segundos e chegue ao seu destino rapidamente.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <Shield className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Seguro</h4>
              <p className="mt-2 text-gray-600">
                Todos os motoristas são verificados e as corridas são monitoradas em tempo real.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <Star className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Qualidade</h4>
              <p className="mt-2 text-gray-600">
                Sistema de avaliações para garantir a melhor experiência para todos.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <MapPin className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Rastreamento</h4>
              <p className="mt-2 text-gray-600">
                Acompanhe sua corrida em tempo real e saiba exatamente onde está seu motorista.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <Users className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Comunidade</h4>
              <p className="mt-2 text-gray-600">
                Conectamos milhares de usuários e motoristas em uma comunidade crescente.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
                <Car className="h-6 w-6 text-primary-600" />
              </div>
              <h4 className="mt-4 text-lg font-medium text-gray-900">Variedade</h4>
              <p className="mt-2 text-gray-600">
                Diferentes tipos de veículos para atender suas necessidades específicas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-3xl font-bold text-white">
            Pronto para começar?
          </h3>
          <p className="mt-4 text-xl text-primary-100">
            Junte-se a milhares de usuários que já confiam no Transport App
          </p>
          <div className="mt-8">
            <Link
              to="/register"
              className="btn bg-white text-primary-600 hover:bg-gray-100 text-lg px-8 py-3"
            >
              Criar conta gratuita
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center">
                <Car className="h-8 w-8 text-primary-400" />
                <span className="ml-2 text-xl font-bold text-white">Transport App</span>
              </div>
              <p className="mt-4 text-gray-400">
                A melhor plataforma de transporte urbano do Brasil.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold">Produto</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Como funciona</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Preços</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Segurança</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold">Empresa</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Sobre nós</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Carreiras</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Imprensa</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold">Suporte</h4>
              <ul className="mt-4 space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white">Central de ajuda</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Contato</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white">Comunidade</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p className="text-gray-400">
              © 2024 Transport App. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home; 