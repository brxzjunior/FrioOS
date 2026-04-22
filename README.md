<div align="center">

# ❄️ FrioOS

### Sistema de Ordens de Serviço para Técnicos de Refrigeração

*Do papel para o digital — organização real para quem trabalha de verdade.*

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)](https://expressjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat)](LICENSE)

</div>

---

## 📌 Índice

- [Sobre o Projeto](#-sobre-o-projeto)
- [O Problema](#-o-problema)
- [Funcionalidades](#-funcionalidades)
- [Arquitetura](#-arquitetura)
- [Tecnologias](#-tecnologias)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar](#️-como-rodar-o-projeto)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Endpoints da API](#-endpoints-da-api)
- [Próximas Melhorias](#-próximas-melhorias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🧭 Sobre o Projeto

O **FrioOS** é um sistema web full-stack desenvolvido para técnicos autônomos de refrigeração (MEI) que precisam de uma solução simples, rápida e profissional para gerenciar clientes, ordens de serviço e histórico financeiro — sem depender de papel, caderno ou WhatsApp.

O projeto nasceu como **PEX (Projeto de Extensão)** com objetivo de gerar impacto real em pequenos negócios da área de refrigeração. A proposta é substituir o fluxo manual e informal por uma ferramenta digital acessível, pensada especificamente para a realidade do técnico que trabalha sozinho ou em pequena equipe.

---

## 🚨 O Problema

A maioria dos técnicos autônomos de refrigeração gerencia o próprio negócio de forma completamente informal:

- Anotações de serviço feitas à mão ou via WhatsApp
- Histórico de clientes perdido com frequência
- Valores cobrados sem registro consistente
- Sem nenhum controle financeiro real
- Nenhum comprovante profissional para entregar ao cliente

Isso resulta em desorganização, retrabalho, perda de receita e falta de credibilidade — problemas que uma ferramenta digital adequada resolve diretamente.

---

## ✅ Funcionalidades

| # | Funcionalidade | Descrição |
|---|---|---|
| 👤 | Cadastro de clientes | Dados completos com histórico de atendimentos vinculado |
| 📋 | Ordens de serviço digitais | Abertura, edição e encerramento de OS com rastreabilidade |
| 🔄 | Controle de status | Acompanhamento em tempo real: aberta → em andamento → concluída |
| 💰 | Registro financeiro | Valor por serviço, com visão consolidada por período |
| 📄 | Geração de PDF | Comprovante profissional para envio ao cliente |
| 📊 | Relatórios mensais | Resumo financeiro do negócio por mês |
| 🗄️ | Persistência em banco | Histórico permanente e seguro em PostgreSQL |

---

## 🧠 Arquitetura

O projeto segue uma arquitetura **cliente-servidor** desacoplada, com comunicação via REST API:

```
┌─────────────────────┐        HTTP/JSON        ┌──────────────────────────┐
│                     │ ──────────────────────► │                          │
│   React + Vite      │                         │   Express + TypeScript   │
│   (Frontend)        │ ◄────────────────────── │   (API REST)             │
│                     │        Response         │                          │
└─────────────────────┘                         └────────────┬─────────────┘
                                                             │
                                                    Service Layer
                                                             │
                                                ┌────────────▼─────────────┐
                                                │      PostgreSQL DB        │
                                                │  clientes · ordens · logs │
                                                └──────────────────────────┘
```

### Camadas

**Frontend — React + Vite + TypeScript**
Interface responsável por telas, formulários, navegação e consumo da API. Organizado em páginas, componentes reutilizáveis e serviços de comunicação HTTP.

**Backend — Node.js + Express + TypeScript**
API REST responsável pelas regras de negócio, validações, roteamento HTTP e persistência. Segue o padrão **MVC** com separação clara entre controllers, services e models.

**Banco de Dados — PostgreSQL**
Persistência relacional via PostgreSQL. Oferece robustez, suporte a queries complexas e escalabilidade para crescimento futuro do sistema.

---

## 🛠️ Tecnologias

**Frontend**

| Tecnologia | Versão | Uso |
|---|---|---|
| [React](https://reactjs.org/) | ^18 | Interface de usuário |
| [Vite](https://vitejs.dev/) | ^5 | Build tool e dev server |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Tipagem estática |
| [React Router](https://reactrouter.com/) | ^6 | Navegação entre páginas |
| [Axios](https://axios-http.com/) | ^1 | Requisições HTTP |

**Backend**

| Tecnologia | Versão | Uso |
|---|---|---|
| [Node.js](https://nodejs.org/) | ≥18 | Runtime JavaScript |
| [Express](https://expressjs.com/) | ^4 | Framework HTTP |
| [TypeScript](https://www.typescriptlang.org/) | ^5 | Tipagem estática |
| [PostgreSQL](https://www.postgresql.org/) | ≥15 | Banco de dados relacional |

---

## 📂 Estrutura de Pastas

```
frioos/
├── frioos-frontend/
│   └── src/
│       ├── pages/              # Telas da aplicação (Clientes, OS, Relatórios)
│       ├── components/         # Componentes reutilizáveis (Botões, Cards, Modais)
│       ├── routes/             # Configuração de rotas (React Router)
│       ├── services/           # Funções de comunicação com a API (Axios)
│       ├── types/              # Interfaces e tipos TypeScript
│       └── App.tsx             # Componente raiz
│
└── frioos-backend/
    └── src/
        ├── server.ts           # Ponto de entrada da aplicação
        ├── routes/             # Definição das rotas HTTP
        ├── controllers/        # Lógica de requisição e resposta
        ├── services/           # Regras de negócio
        ├── models/             # Modelos de dados e queries
        └── database/
            ├── connection.ts   # Configuração da conexão PostgreSQL
            ├── schema.ts       # DDL — criação das tabelas
            └── db.ts           # Instância compartilhada do banco
```

---

## ⚙️ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- [Node.js](https://nodejs.org/) — versão **18 ou superior**
- [npm](https://www.npmjs.com/) — instalado automaticamente com o Node.js
- [Git](https://git-scm.com/)

---

## ▶️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/brxzjunior/frioos.git
cd frioos
```

### 2. Backend

```bash
cd frioos-backend
npm install
npm run dev
```

> API disponível em: [http://localhost:3333](http://localhost:3333)

### 3. Frontend

Em um segundo terminal, a partir da raiz do projeto:

```bash
cd frioos-frontend
npm install
npm run dev
```

> Aplicação disponível em: [http://localhost:5173](http://localhost:5173)

---

## 🔐 Variáveis de Ambiente

### Backend — `frioos-backend/.env`

```env
PORT=3333
DATABASE_URL=postgresql://usuario:senha@localhost:5432/frioos
```

Crie o arquivo `.env` com base no exemplo acima, substituindo `usuario` e `senha` pelas credenciais do seu PostgreSQL local.

---

## 📡 Endpoints da API

**Base URL:** `http://localhost:3333/api`

### 👤 Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/clients` | Lista todos os clientes |
| `GET` | `/clients/:id` | Busca um cliente por ID |
| `POST` | `/clients` | Cria um novo cliente |
| `PUT` | `/clients/:id` | Atualiza dados de um cliente |
| `DELETE` | `/clients/:id` | Remove um cliente |

**`POST /api/clients` — Exemplo de body**

```json
{
  "nome": "João Silva",
  "telefone": "92 99999-9999",
  "endereco": "Rua A, 123 — Manaus/AM"
}
```

### 📋 Ordens de Serviço

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/orders` | Lista todas as ordens de serviço |
| `GET` | `/orders/:id` | Busca uma OS por ID |
| `POST` | `/orders` | Cria uma nova OS |
| `PUT` | `/orders/:id` | Atualiza dados de uma OS |
| `PATCH` | `/orders/:id/status` | Atualiza apenas o status da OS |
| `DELETE` | `/orders/:id` | Remove uma OS |

**`POST /api/orders` — Exemplo de body**

```json
{
  "clienteId": 1,
  "descricao": "Manutenção preventiva ar-condicionado split 12.000 BTUs",
  "valor": 150.00,
  "status": "aberta"
}
```

**Status disponíveis:** `aberta` · `em_andamento` · `concluida` · `cancelada`

---

## 📌 Últimas Melhorias

- [✅] Autenticação com login e sessão (JWT)
- [✅] Dashboard com gráficos financeiros mensais
- [✅] Controle de estoque de peças e insumos
- [✅] Versão mobile (PWA)
- [✅] Deploy em nuvem (Supabase / Render)

---

## 🤝 Contribuição

Contribuições são bem-vindas! Para contribuir:

1. Faça um fork do repositório
2. Crie uma branch com sua feature: `git checkout -b feat/minha-feature`
3. Commit suas alterações: `git commit -m 'feat: adiciona minha feature'`
4. Push para a branch: `git push origin feat/minha-feature`
5. Abra um Pull Request

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com ❤️ por [Braz Junior](https://github.com/brxzjunior) — Manaus, AM

</div>
