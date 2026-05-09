# 🐾 Petshop API — Sistema Backend Completo para Gestão Veterinária

API RESTful profissional desenvolvida para gerenciamento de um petshop/clínica veterinária, com autenticação JWT, controle de permissões por cargos, fluxo completo de agendamentos, atendimentos, pagamentos e prontuários veterinários.

Projeto focado em arquitetura backend moderna, regras de negócio reais, segurança, escalabilidade e testes automatizados.

---

# ✨ Funcionalidades

## 🔐 Autenticação e Autorização
- Cadastro de usuários
- Login com JWT
- Refresh Token
- Logout seguro
- Controle de acesso por cargos (RBAC)

### Perfis suportados
- `admin`
- `atendente`
- `veterinario`
- `cliente`

---

## 📅 Agendamentos
- Criar agendamentos
- Cancelar agendamentos
- Impedir conflitos de horário
- Regras de antecedência mínima
- Controle de acesso por usuário
- Admin pode visualizar/agendar para todos

---

## 🩺 Atendimento Veterinário
- Criação de atendimento a partir de agendamento confirmado
- Controle de status do atendimento
- Bloqueio de avanço sem pagamento aprovado
- Fluxo operacional completo

---

## 💳 Pagamentos
- Pagamentos pendentes
- Aprovação de pagamento
- Recusa de pagamento
- Integração com fluxo de atendimento

---

## 📋 Prontuário Veterinário
- Histórico médico do pet
- Criação de itens no prontuário
- Registro de consultas
- Controle de acesso por perfil
- Cliente pode visualizar apenas o próprio pet

---

## 🛡️ Segurança
- JWT Authentication
- Helmet
- Rate Limiting
- Validação com Zod
- Middlewares de autenticação
- Middlewares de autorização

---

## 📚 Documentação Swagger
A API possui documentação interativa via Swagger.

### Endpoint:
```bash
/docs
```

---

# 🧱 Tecnologias Utilizadas

## Backend
- Node.js
- Express.js

## Banco de Dados
- PostgreSQL
- Prisma ORM

## Segurança
- JWT
- bcrypt
- Helmet
- express-rate-limit

## Validação
- Zod

## Testes
- Jest
- Supertest

## Documentação
- Swagger OpenAPI

---

# 🧪 Testes Automatizados

O projeto possui testes E2E cobrindo os principais fluxos da aplicação:

✅ Autenticação  
✅ Agendamentos  
✅ Atendimento  
✅ Pagamentos  
✅ Prontuário  

### Resultado atual:
```bash
Test Suites: 3 passed
Tests: 14 passed
```

---

# 📂 Estrutura do Projeto

```bash
src/
├── controllers/
├── middlewares/
├── routes/
├── schemas/
├── services/
├── prisma/
├── docs/
├── utils/
├── server.js
└── app.js
```

---

# ⚙️ Instalação

## 1. Clonar repositório

```bash
git clone https://github.com/RaquelLisboa7/Petshop.git
```

---

## 2. Instalar dependências

```bash
npm install
```

---

## 3. Configurar variáveis de ambiente

Crie um arquivo `.env`

```env
DATABASE_URL=""
JWT_SECRET=""
REFRESH_TOKEN_SECRET=""
PORT=6500
```

---

## 4. Rodar migrations

```bash
npx prisma migrate dev
```

---

## 5. Rodar servidor

```bash
npm run dev
```

Servidor:
```bash
http://localhost:6500
```

---

# 🚀 Scripts Disponíveis

## Rodar ambiente de desenvolvimento

```bash
npm run dev
```

## Rodar testes

```bash
npm test
```

## Prisma Studio

```bash
npx prisma studio
```

---

# 🔄 Fluxo de Negócio

## Fluxo principal do sistema

```text
Usuário agenda atendimento
        ↓
Agendamento confirmado
        ↓
Atendimento criado
        ↓
Pagamento gerado
        ↓
Pagamento aprovado
        ↓
Atendimento pode avançar
        ↓
Veterinário registra prontuário
```

---

# 🎯 Objetivos Técnicos do Projeto

Este projeto foi desenvolvido com foco em:

- Arquitetura backend organizada
- Boas práticas REST
- Separação de responsabilidades
- Regras de negócio reais
- Escalabilidade
- Segurança
- Testes automatizados
- Código limpo e sustentável

---

# 📌 Principais Conceitos Aplicados

- REST API
- Middleware Pattern
- RBAC (Role-Based Access Control)
- JWT Authentication
- Validation Layer
- Error Handling
- ORM Pattern
- E2E Testing
- Modular Architecture

---

# 👩‍💻 Desenvolvido por

## Raquel Lisboa

Desenvolvedora Backend focada em:
- Node.js
- APIs REST
- PostgreSQL
- Prisma ORM
- Arquitetura Backend
- Segurança de aplicações
- Testes automatizados

---

# ⭐ Diferenciais do Projeto

✅ Fluxo completo de negócio  
✅ Arquitetura escalável  
✅ Sistema de permissões  
✅ Segurança aplicada  
✅ Testes E2E reais  
✅ Swagger documentado  
✅ Regras de negócio complexas  
✅ Projeto preparado para deploy e Docker  

---

# 📄 Licença

Projeto desenvolvido para fins educacionais e portfólio.