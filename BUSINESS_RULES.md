# Regras de Negócio - Transport App

## 📋 Visão Geral
Este documento define as regras de negócio da aplicação Transport App, servindo como base para desenvolvimento de testes automatizados e validação de funcionalidades.

---

## 👥 Gestão de Usuários

### 1. Registro de Usuários
- **RN001**: Usuários devem fornecer nome, email, telefone e senha para registro
- **RN002**: Email deve ser único no sistema
- **RN003**: Senha deve ter mínimo 6 caracteres
- **RN004**: Telefone deve seguir formato brasileiro (XX) XXXXX-XXXX
- **RN005**: Usuários podem se registrar como "passenger" ou "driver"
- **RN006**: Usuários "driver" precisam completar perfil de motorista após registro

### 2. Autenticação
- **RN007**: Login requer email e senha válidos
- **RN008**: Contas não verificadas podem fazer login mas com limitações
- **RN009**: Após 3 tentativas de login falhadas, conta é bloqueada por 15 minutos
- **RN010**: Tokens JWT expiram em 24 horas
- **RN011**: Refresh tokens expiram em 7 dias

### 3. Perfis de Usuário
- **RN012**: Usuários podem ter apenas um perfil ativo por vez
- **RN013**: Passageiros podem se tornar motoristas (e vice-versa)
- **RN014**: Mudança de perfil requer aprovação administrativa
- **RN015**: Dados pessoais podem ser atualizados a qualquer momento

---

## 🚗 Gestão de Motoristas

### 4. Cadastro de Motoristas
- **RN016**: Motoristas devem fornecer número da CNH e data de validade
- **RN017**: CNH deve estar válida (não expirada)
- **RN018**: Motoristas devem enviar documentos (CNH, RG, comprovante de residência)
- **RN019**: Perfil de motorista requer verificação administrativa
- **RN020**: Motoristas verificados recebem badge "Verificado" no perfil

### 5. Status de Motoristas
- **RN021**: Motoristas podem ter status: "available", "busy", "offline"
- **RN022**: Motoristas "available" aparecem na busca de passageiros
- **RN023**: Motoristas "busy" não recebem novas solicitações
- **RN024**: Motoristas "offline" ficam invisíveis para passageiros
- **RN025**: Status é atualizado automaticamente baseado em atividade

### 6. Localização de Motoristas
- **RN026**: Localização é atualizada a cada 30 segundos quando online
- **RN027**: Busca de motoristas considera raio de 5km por padrão
- **RN028**: Motoristas mais próximos aparecem primeiro na lista
- **RN029**: Localização é armazenada com precisão de 3 casas decimais

---

## 🚙 Gestão de Veículos

### 7. Cadastro de Veículos
- **RN030**: Motoristas podem cadastrar múltiplos veículos
- **RN031**: Veículos devem ter placa, marca, modelo, ano e cor
- **RN032**: Placa deve seguir formato brasileiro (ABC-1234 ou ABC1D23)
- **RN033**: Veículos devem ter capacidade mínima de 4 passageiros
- **RN034**: Documentação do veículo deve estar em dia

### 8. Tipos de Veículos
- **RN035**: Tipos disponíveis: "standard", "comfort", "premium", "van"
- **RN036**: Preços variam por tipo: standard (base), comfort (+20%), premium (+50%), van (+30%)
- **RN037**: Vans têm capacidade mínima de 8 passageiros
- **RN038**: Veículos premium devem ter ar condicionado e Wi-Fi

---

## 🚕 Gestão de Corridas

### 9. Solicitação de Corridas
- **RN039**: Passageiros devem informar origem e destino
- **RN040**: Sistema calcula preço baseado em distância e tipo de veículo
- **RN041**: Preço base: R$ 2,50 por km + R$ 5,00 taxa fixa
- **RN042**: Horário de pico (7h-9h e 17h-19h): +30% no preço
- **RN043**: Solicitações são enviadas para motoristas em raio de 5km
- **RN044**: Motoristas têm 30 segundos para aceitar corrida

### 10. Aceitação de Corridas
- **RN045**: Motoristas recebem notificação push para novas solicitações
- **RN046**: Primeiro motorista a aceitar ganha a corrida
- **RN047**: Motoristas podem recusar corridas sem penalidade
- **RN048**: Sistema notifica passageiro quando corrida é aceita
- **RN049**: Corrida é cancelada automaticamente se nenhum motorista aceitar

### 11. Execução de Corridas
- **RN050**: Status da corrida: "requested", "accepted", "in_progress", "completed", "cancelled"
- **RN051**: Motorista deve confirmar chegada no local de partida
- **RN052**: Passageiro deve confirmar embarque
- **RN053**: Corrida só inicia após confirmação do passageiro
- **RN054**: Sistema rastreia rota em tempo real

### 12. Finalização de Corridas
- **RN055**: Motorista confirma chegada no destino
- **RN056**: Sistema calcula preço final baseado em distância real
- **RN057**: Passageiro pode avaliar motorista (1-5 estrelas)
- **RN058**: Motorista pode avaliar passageiro (1-5 estrelas)
- **RN059**: Pagamento é processado automaticamente

---

## 💰 Sistema de Pagamentos

### 13. Métodos de Pagamento
- **RN060**: Aceita cartão de crédito, débito e PIX
- **RN061**: Cartões devem ser salvos de forma segura (tokenização)
- **RN062**: PIX deve gerar QR Code para pagamento
- **RN063**: Pagamento deve ser confirmado antes da corrida

### 14. Comissões e Taxas
- **RN064**: Aplicativo cobra 15% de comissão sobre cada corrida
- **RN065**: Motoristas recebem 85% do valor da corrida
- **RN066**: Pagamentos são processados em até 48h
- **RN067**: Taxa de cancelamento: R$ 5,00 se cancelado após aceitação

---

## ⭐ Sistema de Avaliações

### 15. Critérios de Avaliação
- **RN068**: Avaliações consideram: pontualidade, limpeza, segurança, atendimento
- **RN069**: Média mínima para motoristas: 4,0 estrelas
- **RN070**: Motoristas com média abaixo de 3,5 são suspensos
- **RN071**: Avaliações são anônimas para motoristas
- **RN072**: Sistema detecta avaliações falsas

---

## 🔔 Sistema de Notificações

### 16. Tipos de Notificação
- **RN073**: Push notifications para solicitações de corrida
- **RN074**: Email para confirmações e relatórios
- **RN075**: SMS para códigos de verificação
- **RN076**: Notificações em tempo real via WebSocket

### 17. Configurações de Notificação
- **RN077**: Usuários podem desativar notificações push
- **RN078**: Notificações de marketing requerem consentimento
- **RN079**: Notificações críticas não podem ser desativadas

---

## 🛡️ Segurança e Privacidade

### 18. Proteção de Dados
- **RN080**: Dados pessoais são criptografados
- **RN081**: Localização é anonimizada após 30 dias
- **RN082**: Logs de acesso são mantidos por 1 ano
- **RN083**: Usuários podem solicitar exclusão de dados

### 19. Verificação de Identidade
- **RN084**: Motoristas devem enviar selfie com documento
- **RN085**: Verificação facial é obrigatória para motoristas
- **RN086**: Documentos são verificados por terceiros
- **RN087**: Contas suspeitas são investigadas

---

## 📊 Relatórios e Analytics

### 20. Métricas de Performance
- **RN088**: Tempo médio de resposta dos motoristas
- **RN089**: Taxa de aceitação de corridas
- **RN090**: Satisfação média dos usuários
- **RN091**: Receita por região e período

### 21. Relatórios Administrativos
- **RN092**: Relatórios diários, semanais e mensais
- **RN093**: Exportação em CSV e PDF
- **RN094**: Dashboards em tempo real
- **RN095**: Alertas para anomalias

---

## 🚨 Casos Especiais

### 22. Cancelamentos
- **RN096**: Passageiros podem cancelar até 2 minutos após aceitação
- **RN097**: Motoristas podem cancelar apenas por motivos justificados
- **RN098**: Cancelamentos frequentes geram penalidades
- **RN099**: Cancelamentos por segurança são isentos de taxa

### 23. Problemas e Disputas
- **RN100**: Sistema de denúncias para problemas
- **RN101**: Disputas são analisadas em até 48h
- **RN102**: Reembolsos são processados em até 5 dias úteis
- **RN103**: Usuários podem recorrer de decisões

---

## 🧪 Cenários de Teste Sugeridos

### Testes de Regressão
- Registro e login de usuários
- Criação de perfil de motorista
- Solicitação e aceitação de corridas
- Processamento de pagamentos
- Sistema de avaliações

### Testes de Performance
- Carga de múltiplas solicitações simultâneas
- Tempo de resposta da API
- Uso de memória e CPU
- Latência de notificações em tempo real

### Testes de Segurança
- Validação de tokens JWT
- Proteção contra SQL injection
- Rate limiting
- Criptografia de dados sensíveis

### Testes de Usabilidade
- Fluxo completo de solicitação de corrida
- Responsividade em diferentes dispositivos
- Acessibilidade (WCAG 2.1)
- Experiência offline

---

## 📝 Notas de Implementação

- Todas as regras devem ser validadas tanto no frontend quanto no backend
- Logs detalhados devem ser mantidos para auditoria
- Testes automatizados devem cobrir todos os cenários críticos
- Documentação da API deve estar sempre atualizada
- Monitoramento em tempo real deve alertar sobre violações de regras 