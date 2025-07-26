# 🎪 EventFlow - Plataforma de Gestão de Eventos

Uma aplicação web completa para gestão de eventos e conferências, desenvolvida com foco em automação de testes e boas práticas de desenvolvimento.

## 🎯 Objetivo

Este projeto foi desenvolvido para consolidar conhecimentos em automação de testes (API, UI, performance, etc) e criar um sistema com regras de negócio realistas para exercitar diferentes tipos de testes.

## 🏗️ Arquitetura

### Backend
- **Node.js** + **Express.js** - Servidor REST API
- **MongoDB** - Banco de dados principal
- **Redis** - Cache e sessões
- **Socket.IO** - Comunicação em tempo real
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Multer** - Upload de arquivos
- **Nodemailer** - Envio de emails
- **Stripe** - Processamento de pagamentos

### Frontend
- **React** + **Vite** - Interface do usuário
- **Tailwind CSS** - Estilização
- **React Query** - Gerenciamento de estado
- **React Router** - Navegação
- **Socket.IO Client** - Comunicação em tempo real
- **React Hook Form** - Formulários
- **Framer Motion** - Animações

## 🚀 Funcionalidades

### 👥 Gestão de Usuários
- Registro e login com verificação de email
- Perfis com diferentes roles (Admin, Organizador, Palestrante, Participante)
- Upload de avatar
- Preferências personalizáveis

### 🎪 Gestão de Eventos
- CRUD completo de eventos
- Upload de banners e imagens
- Categorização e tags
- Configurações de localização (presencial, online, híbrido)
- Sistema de sessões e palestrantes

### 📝 Sistema de Inscrições
- Inscrições em eventos
- Lista de espera
- Campos customizáveis
- Aprovação manual/automática
- Check-in e check-out

### 💳 Pagamentos
- Integração com Stripe
- Diferentes tipos de ingresso
- Preços early bird
- Reembolsos automáticos

### 💬 Chat em Tempo Real
- Chat durante eventos
- Sistema de Q&A
- Enquetes interativas
- Mensagens privadas

### 📊 Relatórios e Analytics
- Dashboard com métricas
- Relatórios de participação
- Exportação de dados
- Analytics de eventos

### 🔔 Notificações
- Emails automáticos
- Notificações push
- Lembretes de eventos
- Atualizações em tempo real

## 📁 Estrutura do Projeto

```
event-flow/
├── backend/                 # API REST
│   ├── src/
│   │   ├── config/         # Configurações
│   │   ├── controllers/    # Controladores
│   │   ├── middleware/     # Middlewares
│   │   ├── models/         # Modelos MongoDB
│   │   ├── routes/         # Rotas da API
│   │   ├── services/       # Serviços
│   │   ├── socket/         # Socket.IO handlers
│   │   └── utils/          # Utilitários
│   ├── docs/              # Documentação Swagger
│   ├── uploads/           # Arquivos enviados
│   └── logs/              # Logs da aplicação
├── frontend/              # Interface React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Serviços API
│   │   ├── context/       # Context API
│   │   └── utils/         # Utilitários
│   └── public/            # Arquivos estáticos
└── docs/                  # Documentação geral
```

## 🛠️ Instalação e Configuração

### Pré-requisitos
- Node.js 18+
- MongoDB 6+
- Redis 6+
- Git

### 1. Clone o repositório
```bash
git clone https://github.com/matheusalexan/event-flow.git
cd event-flow
```

### 2. Configure o Backend
```bash
cd backend
npm install
cp env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Configure o Frontend
```bash
cd ../frontend
npm install
```

### 4. Configure as Variáveis de Ambiente

#### Backend (.env)
```env
# Server
NODE_ENV=development
PORT=3001
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/eventflow
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@eventflow.com

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

### 5. Inicie os Serviços

#### MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongod
```

#### Redis
```bash
# macOS (Homebrew)
brew services start redis

# Ubuntu
sudo systemctl start redis
```

### 6. Execute a Aplicação

#### Backend
```bash
cd backend
npm run dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

## 🧪 Testes

### Backend
```bash
cd backend
npm test              # Executa todos os testes
npm run test:watch    # Modo watch
npm run test:coverage # Com cobertura
```

### Frontend
```bash
cd frontend
npm test              # Executa todos os testes
npm run test:ui       # Interface visual
npm run test:coverage # Com cobertura
```

## 📚 Documentação da API

A documentação da API está disponível em:
- **Desenvolvimento**: http://localhost:3001/api-docs
- **Swagger JSON**: http://localhost:3001/docs/swagger.json

## 🔄 Branches e Versionamento

### Branches Principais
- `main` - Código de produção
- `development` - Desenvolvimento

### Branches de Funcionalidades
1. `feat/setup-projeto` - ✅ Estrutura inicial
2. `feat/autenticacao` - 🔄 Sistema de autenticação
3. `feat/gestao-usuarios` - 📋 Gestão de usuários
4. `feat/gestao-eventos` - 🎪 Gestão de eventos
5. `feat/sistema-inscricoes` - 📝 Sistema de inscrições
6. `feat/chat-tempo-real` - 💬 Chat em tempo real
7. `feat/relatorios-analytics` - 📊 Relatórios e analytics
8. `feat/frontend-completo` - 🎨 Frontend completo

### Conventional Commits
```
feat: adiciona nova funcionalidade
fix: corrige bug
docs: atualiza documentação
style: formatação de código
refactor: refatoração
test: adiciona ou corrige testes
chore: tarefas de manutenção
```

## 🚀 Deploy

### Backend (Heroku)
```bash
cd backend
heroku create eventflow-api
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set REDIS_URL=your-redis-url
git push heroku main
```

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feat/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: add some AmazingFeature'`)
4. Push para a branch (`git push origin feat/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

**Matheus Macedo**
- GitHub: [@matheusalexan](https://github.com/matheusalexan)
- LinkedIn: [Matheus Macedo](https://linkedin.com/in/matheus-macedo)

## 🙏 Agradecimentos

- Comunidade de QA e Devs que contribuem com feedback
- Stack Overflow e documentações das tecnologias utilizadas
- Inspiração em outras plataformas de eventos

---

**EventFlow** - Transformando a forma como organizamos e participamos de eventos! 🎉 