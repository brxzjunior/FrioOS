# ❄️ FrioOS — Sistema de Ordens de Serviço para Técnicos de Refrigeração

> Sistema web full-stack desenvolvido para ajudar técnicos autônomos (MEI) a organizar clientes, ordens de serviço e histórico financeiro — substituindo anotações em papel por uma solução digital simples e profissional.

Projeto criado como **PEX (Projeto de Experiência)** com foco em impacto real em pequenos negócios.

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-003B57?style=flat&logo=sqlite&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)
![MIT License](https://img.shields.io/badge/License-MIT-green?style=flat)

---

## 📌 Índice

- [O Problema](#-o-problema)
- [A Solução](#-a-solução)
- [Arquitetura](#-arquitetura-do-projeto)
- [Tecnologias](#-tecnologias)
- [Estrutura de Pastas](#-estrutura-de-pastas)
- [Pré-requisitos](#-pré-requisitos)
- [Como Rodar](#️-como-rodar-o-projeto)
- [Endpoints da API](#-endpoints-da-api)
- [Conceitos Aplicados](#-conceitos-aplicados)
- [Próximas Melhorias](#-próximas-melhorias)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

---

## 🚨 O Problema

Técnicos de refrigeração geralmente:

- Anotam serviços no papel ou no WhatsApp
- Perdem histórico de clientes
- Esquecem valores recebidos
- Não têm controle financeiro
- Não geram comprovantes

Isso gera:

- ❌ Desorganização
- ❌ Retrabalho
- ❌ Perda de dinheiro
- ❌ Pouca credibilidade com clientes

---

## ✅ A Solução

O **FrioOS** centraliza tudo em um único sistema:

| Funcionalidade | Descrição |
|---|---|
| 👤 Cadastro de clientes | Dados completos e histórico de atendimentos |
| 📋 Ordens de serviço digitais | Abertura, edição e encerramento de OS |
| 🔄 Controle de status | Acompanhe cada OS em tempo real |
| 💰 Registro de valores | Controle financeiro por serviço |
| 📄 Geração de PDF | Comprovantes profissionais para o cliente |
| 📊 Relatórios mensais | Visão financeira do negócio |
| 🗄️ Persistência em banco de dados | Histórico permanente e seguro |

---

## 🧠 Arquitetura do Projeto

```
Frontend (React) ──→ API REST (Express) ──→ Service Layer ──→ SQLite Database
       ↑                                                              │
       └──────────────────── Response ────────────────────────────────┘
```

### 🟢 Frontend — React + Vite + TypeScript
Interface do usuário responsável por telas, formulários, navegação e consumo da API.

### 🔵 Backend — Node.js + Express + TypeScript
API REST responsável por regras de negócio, validações, endpoints HTTP e comunicação com o banco.

### 🟣 Banco de Dados — SQLite
Persistência local responsável por salvar clientes, ordens de serviço e histórico permanente.

---

## 🛠️ Tecnologias

**Frontend**
- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [React Router](https://reactrouter.com/)
- [Axios](https://axios-http.com/)

**Backend**
- [Node.js](https://nodejs.org/)
- [Express](https://expressjs.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [SQLite3](https://www.sqlite.org/)

---

## 📂 Estrutura de Pastas

```
frioos/
├── frioos-frontend/
│   └── src/
│       ├── pages/          # Telas da aplicação
│       ├── components/     # Componentes reutilizáveis
│       ├── routes/         # Configuração de rotas
│       ├── services/       # Comunicação com a API
│       ├── types/          # Tipagens TypeScript
│       └── App.tsx
│
└── frioos-backend/
    └── src/
        ├── server.ts       # Ponto de entrada
        ├── routes/         # Definição das rotas HTTP
        ├── controllers/    # Lógica de requisição/resposta
        ├── services/       # Regras de negócio
        ├── models/         # Modelos de dados
        └── database/
            ├── connection.ts
            ├── schema.ts
            └── db.ts
```

---

## ⚙️ Pré-requisitos

Antes de começar, você precisa ter instalado:

- [Node.js](https://nodejs.org/) — versão 18 ou superior
- [npm](https://www.npmjs.com/) — vem junto com o Node.js
- [Git](https://git-scm.com/)

---

## ▶️ Como Rodar o Projeto

### 1. Clone o repositório

```bash
git clone https://github.com/brxzjunior/frioos.git
cd frioos
```

### 2. 🟢 Frontend

```bash
cd frioos-frontend
npm install
npm run dev
```

Acesse: [http://localhost:5173](http://localhost:5173)

### 3. 🔵 Backend

Em outro terminal:

```bash
cd frioos-backend
npm install
npm run dev
```

Acesse: [http://localhost:3333](http://localhost:3333)

---

## 📡 Endpoints da API

Base URL: `http://localhost:3333/api`

### 👤 Clientes

| Método | Rota | Descrição |
|--------|------|-----------|
| `GET` | `/clients` | Lista todos os clientes |
| `GET` | `/clients/:id` | Busca um cliente por ID |
| `POST` | `/clients` | Cria um novo cliente |
| `PUT` | `/clients/:id` | Atualiza dados de um cliente |
| `DELETE` | `/clients/:id` | Remove um cliente |

**Exemplo — Criar cliente** `POST /api/clients`

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
| `PUT` | `/orders/:id` | Atualiza uma OS |
| `PATCH` | `/orders/:id/status` | Atualiza o status de uma OS |
| `DELETE` | `/orders/:id` | Remove uma OS |

**Exemplo — Criar OS** `POST /api/orders`

```json
{
  "clienteId": 1,
  "descricao": "Manutenção preventiva ar-condicionado split",
  "valor": 150.00,
  "status": "aberta"
}
```

---

## 🧩 Conceitos Aplicados

Este projeto foi construído para praticar:

- Arquitetura **MVC** (Model-View-Controller)
- Separação de responsabilidades
- **CRUD** completo
- **REST API** com Express
- Integração Front-end ⇄ Back-end
- Banco de dados relacional com **SQLite**
- **TypeScript** full-stack

---

## 💡 Impacto Real

Benefícios diretos para o técnico:

- ✅ Organização profissional
- ✅ Histórico completo de clientes
- ✅ Controle financeiro
- ✅ Menos erros e retrabalho
- ✅ Mais credibilidade com clientes
- ✅ Economia de tempo

---

## 📌 Próximas Melhorias

- [ ] Autenticação e login
- [ ] Geração de PDF por OS
- [ ] Dashboard com gráficos financeiros
- [ ] Controle de estoque de peças
- [ ] Versão mobile (PWA)
- [ ] Deploy em nuvem

---

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para:

1. Fazer um fork do projeto
2. Criar uma branch: `git checkout -b minha-feature`
3. Commitar suas mudanças: `git commit -m 'feat: minha nova feature'`
4. Abrir um Pull Request

Ou simplesmente abra uma [issue](https://github.com/brxzjunior/frioos/issues) com sugestões e melhorias.

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<p align="center">
  Feito com ❤️ por <a href="https://github.com/brxzjunior">Braz Junior</a>
</p>
