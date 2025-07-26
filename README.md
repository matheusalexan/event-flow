# 🚗 Transport App

Uma aplicação completa de transporte urbano desenvolvida para fins de teste e aprendizado.

## 📋 Objetivo

Esta aplicação foi criada para consolidar conhecimentos em diferentes tipos de automação de testes (API, UI, Performance) e fornecer um sistema realista com regras de negócio desafiadoras para exercitar diferentes cenários de teste.

## 🏗️ Arquitetura

### Backend
- **Node.js** + **Express.js** - Servidor REST API
- **MongoDB** + **Mongoose** - Banco de dados NoSQL
- **Redis** - Cache e sessões
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação e autorização
- **Swagger** - Documentação da API
- **Multer** + **Sharp** - Upload e processamento de imagens
- **Nodemailer** - Envio de emails
- **Winston** - Logging estruturado
- **Joi** - Validação de dados
- **Express Validator** - Validação de requisições

### Frontend
- **React** + **Vite** - Interface de usuário
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado do servidor
- **React Router** - Navegação
- **React Hook Form** - Formulários
- **Socket.IO Client** - Comunicação em tempo real
- **Framer Motion** - Animações
- **Recharts** - Gráficos e visualizações

## 🎯 Funcionalidades

### 👥 Gestão de Usuários
- Registro e login de usuários
- Perfis de usuário (Admin, Motorista, Passageiro)
- Verificação de email
- Recuperação de senha
- Upload de avatar
- Preferências do usuário

### 🚘 Gestão de Motoristas
- Cadastro de motoristas
- Verificação de documentos (CNH, documentos do veículo)
- Sistema de avaliações
- Controle de status (disponível, ocupado, offline)
- Histórico de corridas e ganhos
- Localização em tempo real

### 🚗 Gestão de Veículos
- Cadastro de veículos
- Verificação de documentos
- Controle de status
- Fotos do veículo
- Histórico de manutenção

### 🚖 Sistema de Corridas
- Solicitação de corridas
- Aceitação por motoristas
- Acompanhamento em tempo real
- Sistema de pagamento
- Avaliações mútuas
- Chat durante a corrida
- Histórico de corridas

### 📊 Relatórios e Analytics
- Dashboard com métricas
- Relatórios de performance
- Exportação de dados
- Gráficos e visualizações

### 🔔 Sistema de Notificações
- Notificações em tempo real
- Emails automáticos
- Push notifications (futuro)

## 🚀 Como Executar

### Pré-requisitos
- Node.js >= 18.0.0
- MongoDB
- Redis
- npm ou yarn

### Instalação

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd transport-app
```

2. **Instale as dependências**
```bash
npm run install:all
```

3. **Configure as variáveis de ambiente**
```bash
# Backend
cd backend
cp env.example .env
# Edite o arquivo .env com suas configurações
```

4. **Inicie os serviços**
```bash
# MongoDB (se não estiver rodando)
brew services start mongodb-community

# Redis (se não estiver rodando)
brew services start redis

# Inicie a aplicação
npm run dev
```

### URLs de Acesso
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Documentação Swagger**: http://localhost:3001/api-docs
- **Health Check**: http://localhost:3001/health

## 📚 Documentação da API

A documentação completa da API está disponível através do Swagger UI em:
http://localhost:3001/api-docs

### Principais Endpoints

#### Autenticação
- `POST /api/v1/auth/register` - Registrar usuário
- `POST /api/v1/auth/login` - Fazer login
- `POST /api/v1/auth/logout` - Fazer logout
- `GET /api/v1/auth/me` - Obter dados do usuário logado

#### Usuários
- `GET /api/v1/users` - Listar usuários (admin)
- `GET /api/v1/users/:id` - Obter usuário específico
- `PUT /api/v1/users/profile` - Atualizar perfil
- `PUT /api/v1/users/:id` - Atualizar usuário (admin)

#### Motoristas
- `GET /api/v1/drivers` - Buscar motoristas próximos
- `GET /api/v1/drivers/:id` - Obter motorista específico

#### Corridas
- `GET /api/v1/rides` - Listar corridas do usuário
- `POST /api/v1/rides` - Solicitar nova corrida

## 🧪 Testes

### Backend
```bash
cd backend
npm test
```

### Frontend
```bash
cd frontend
npm test
```

## 📁 Estrutura do Projeto

```
transport-app/
├── backend/
│   ├── src/
│   │   ├── config/          # Configurações (DB, Redis)
│   │   ├── controllers/     # Controladores da API
│   │   ├── middleware/      # Middlewares (auth, validation)
│   │   ├── models/          # Modelos do MongoDB
│   │   ├── routes/          # Rotas da API
│   │   ├── services/        # Serviços (email, etc)
│   │   ├── socket/          # Handlers do Socket.IO
│   │   ├── utils/           # Utilitários (logger, etc)
│   │   └── server.js        # Servidor principal
│   ├── logs/                # Logs da aplicação
│   ├── uploads/             # Arquivos enviados
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Contextos (Auth, Socket)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços da API
│   │   ├── utils/           # Utilitários
│   │   ├── App.jsx          # Componente principal
│   │   └── main.jsx         # Entry point
│   └── package.json
├── package.json
└── README.md
```

## 🔧 Scripts Disponíveis

### Root
- `npm run dev` - Inicia backend e frontend em desenvolvimento
- `npm run install:all` - Instala dependências de todos os projetos
- `npm run build` - Build do frontend
- `npm run test` - Executa testes do backend

### Backend
- `npm run dev` - Inicia servidor em modo desenvolvimento
- `npm start` - Inicia servidor em produção
- `npm test` - Executa testes
- `npm run lint` - Executa linter

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Build para produção
- `npm run preview` - Preview do build
- `npm test` - Executa testes

## 🎨 Tecnologias de Teste

Esta aplicação foi projetada para suportar diferentes tipos de testes:

### API Testing
- Endpoints REST bem documentados
- Autenticação JWT
- Validação de dados
- Tratamento de erros
- Rate limiting

### UI Testing
- Interface responsiva
- Formulários complexos
- Navegação entre páginas
- Estados de loading
- Notificações

### Performance Testing
- Endpoints otimizados
- Cache com Redis
- Compressão de resposta
- Rate limiting
- Logs estruturados

### E2E Testing
- Fluxos completos de usuário
- Autenticação
- Solicitação de corridas
- Chat em tempo real
- Pagamentos

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👨‍💻 Autor

**Test Analyst** - Desenvolvido para fins de teste e aprendizado

## 🙏 Agradecimentos

- Comunidade Node.js
- Comunidade React
- Contribuidores de todas as bibliotecas utilizadas 