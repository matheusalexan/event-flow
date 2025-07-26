# Transport App - Aplicação de Transporte Urbano

## 🎯 Objetivo
Desenvolver uma aplicação web completa (frontend + backend) para um sistema de transporte urbano, com foco em testes automatizados e qualidade de código. Esta aplicação serve como base para exercitar diferentes tipos de testes (API, UI, performance, etc.) e consolidar conhecimentos em automação de testes.

## 🏗️ Arquitetura

### Backend
- **Node.js** com Express
- **MongoDB** com Mongoose (ODM)
- **Redis** para cache e sessões
- **Socket.IO** para comunicação em tempo real
- **JWT** para autenticação
- **Swagger** para documentação da API
- **Winston** para logging
- **Nodemailer** para emails

### Frontend
- **React** com Vite
- **Tailwind CSS** para estilização
- **React Router** para navegação
- **React Query** para gerenciamento de estado
- **Socket.IO Client** para comunicação em tempo real
- **React Hook Form** para formulários
- **Framer Motion** para animações

## 🚀 Funcionalidades

### Usuários
- Registro e login de usuários
- Perfis de passageiros e motoristas
- Gestão de dados pessoais
- Sistema de avaliações

### Motoristas
- Cadastro de motoristas com verificação
- Gestão de veículos
- Status online/offline
- Histórico de corridas

### Veículos
- Cadastro de veículos
- Diferentes tipos (padrão, confort, premium, van)
- Documentação e fotos
- Status de disponibilidade

### Corridas
- Solicitação de corridas
- Aceitação por motoristas
- Rastreamento em tempo real
- Sistema de pagamentos
- Avaliações mútuas

### Relatórios
- Dashboard administrativo
- Relatórios de performance
- Analytics de uso
- Exportação de dados

### Notificações
- Push notifications
- Email notifications
- Chat em tempo real
- Alertas de segurança

## 📋 Regras de Negócio

Este projeto implementa **103 regras de negócio** detalhadas que servem como base para desenvolvimento de testes automatizados. As regras estão organizadas em 23 categorias principais:

### 🔑 Regras Críticas para Testes

#### Autenticação e Segurança
- **RN007-RN011**: Sistema de login com rate limiting e expiração de tokens
- **RN080-RN087**: Proteção de dados e verificação de identidade
- **RN009**: Bloqueio após 3 tentativas de login falhadas

#### Gestão de Motoristas
- **RN016-RN020**: Cadastro e verificação de motoristas
- **RN021-RN025**: Status e disponibilidade de motoristas
- **RN026-RN029**: Sistema de localização e busca

#### Sistema de Corridas
- **RN039-RN044**: Solicitação e cálculo de preços
- **RN045-RN049**: Aceitação e notificações
- **RN050-RN059**: Execução e finalização de corridas

#### Pagamentos e Avaliações
- **RN060-RN067**: Métodos de pagamento e comissões
- **RN068-RN072**: Sistema de avaliações e qualidade

### 📖 Documentação Completa
Para ver todas as 103 regras de negócio detalhadas, consulte o arquivo [BUSINESS_RULES.md](BUSINESS_RULES.md).

## 📁 Estrutura do Projeto

```
transport-app/
├── backend/                 # API Node.js/Express
│   ├── src/
│   │   ├── config/         # Configurações (DB, Redis)
│   │   ├── controllers/    # Controladores da API
│   │   ├── middleware/     # Middlewares (auth, validation)
│   │   ├── models/         # Modelos Mongoose
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços (email, etc.)
│   │   ├── socket/         # Handlers do Socket.IO
│   │   └── utils/          # Utilitários (logger, etc.)
│   ├── package.json
│   └── .env.example
├── frontend/               # Aplicação React
│   ├── src/
│   │   ├── components/     # Componentes React
│   │   ├── contexts/       # Contextos (Auth, Socket)
│   │   ├── pages/          # Páginas da aplicação
│   │   ├── services/       # Serviços de API
│   │   └── utils/          # Utilitários
│   ├── package.json
│   └── vite.config.js
├── package.json            # Scripts do monorepo
├── BUSINESS_RULES.md       # Regras de negócio detalhadas
└── README.md
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js >= 18.0.0
- MongoDB
- Redis
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/matheusalexan/event-flow.git
cd event-flow
```

### 2. Instale as dependências
```bash
npm run install:all
```

### 3. Configure as variáveis de ambiente
```bash
# Backend
cp backend/.env.example backend/.env
# Edite o arquivo backend/.env com suas configurações
```

### 4. Inicie os serviços
```bash
# MongoDB (se não estiver rodando)
brew services start mongodb-community

# Redis (se não estiver rodando)
brew services start redis

# Aplicação
npm run dev
```

### 5. Acesse a aplicação
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Swagger Docs**: http://localhost:3001/api-docs

## 🧪 Testes

### Cenários de Teste Baseados nas Regras de Negócio

#### Testes de Regressão (Baseados em RN001-RN059)
- ✅ Registro e login de usuários
- ✅ Criação de perfil de motorista
- 🔄 Solicitação e aceitação de corridas
- 🔄 Processamento de pagamentos
- 🔄 Sistema de avaliações

#### Testes de Performance (Baseados em RN088-RN091)
- 🔄 Carga de múltiplas solicitações simultâneas
- 🔄 Tempo de resposta da API
- 🔄 Uso de memória e CPU
- 🔄 Latência de notificações em tempo real

#### Testes de Segurança (Baseados em RN080-RN087)
- ✅ Validação de tokens JWT
- 🔄 Proteção contra SQL injection
- 🔄 Rate limiting
- 🔄 Criptografia de dados sensíveis

#### Testes de Usabilidade (Baseados em RN039-RN059)
- 🔄 Fluxo completo de solicitação de corrida
- 🔄 Responsividade em diferentes dispositivos
- 🔄 Acessibilidade (WCAG 2.1)
- 🔄 Experiência offline

### Executar testes
```bash
# Testes do backend
npm run test

# Testes do frontend
cd frontend && npm run test
```

### Cobertura de testes
- Testes unitários para modelos e controladores
- Testes de integração para APIs
- Testes E2E para fluxos críticos
- Testes de performance

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger em:
http://localhost:3001/api-docs

### Principais endpoints:
- `POST /api/v1/auth/register` - Registro de usuários
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/users` - Listar usuários
- `GET /api/v1/drivers` - Buscar motoristas próximos
- `POST /api/v1/rides` - Solicitar corrida
- `PUT /api/v1/rides/:id/status` - Atualizar status da corrida

## 📋 Scripts Disponíveis

### Root (Monorepo)
- `npm run dev` - Inicia backend e frontend em desenvolvimento
- `npm run dev:backend` - Inicia apenas o backend
- `npm run dev:frontend` - Inicia apenas o frontend
- `npm run install:all` - Instala dependências de todos os projetos
- `npm run build` - Build do frontend
- `npm run test` - Executa testes do backend
- `npm run start` - Inicia aplicação em produção

### Backend
- `npm run dev` - Inicia em modo desenvolvimento com nodemon
- `npm run start` - Inicia em modo produção
- `npm run test` - Executa testes
- `npm run lint` - Executa linter

### Frontend
- `npm run dev` - Inicia servidor de desenvolvimento
- `npm run build` - Gera build de produção
- `npm run preview` - Preview do build
- `npm run test` - Executa testes
- `npm run lint` - Executa linter

## 🤝 Contribuição

### Estrutura de Branches
- `main` - Código em produção
- `feat/setup-projeto` - Configuração inicial ✅
- `feat/autenticacao` - Sistema de autenticação ✅
- `feat/gestao-usuarios` - Gestão de usuários ✅
- `feat/gestao-corridas` - Gestão de corridas 🔄
- `feat/notificacoes` - Sistema de notificações 🔄
- `feat/relatorios` - Relatórios e analytics 🔄
- `feat/frontend-completo` - Frontend completo 🔄

### Padrão de Commits
Seguimos o padrão [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação de código
- `refactor:` - Refatoração
- `test:` - Adição de testes
- `chore:` - Tarefas de manutenção

### Processo de Contribuição
1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feat/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feat/nova-funcionalidade`)
5. Abra um Pull Request

## 🎯 Objetivos de Teste

### Para Analistas de Teste
- **Consolidar conhecimentos** em automação de testes (API, UI, performance)
- **Criar cenários realistas** baseados em regras de negócio complexas
- **Praticar diferentes tipos de teste** em um ambiente controlado
- **Desenvolver estratégias de teste** para aplicações fullstack

### Para Desenvolvedores
- **Implementar regras de negócio** complexas e realistas
- **Praticar TDD/BDD** com cenários bem definidos
- **Desenvolver APIs robustas** com validações completas
- **Integrar diferentes tecnologias** de forma eficiente

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Test Analyst** - Desenvolvido para fins de teste e aprendizado

## 📞 Suporte

Para dúvidas ou suporte, abra uma [issue](https://github.com/matheusalexan/event-flow/issues) no GitHub. 