# ❄️ FrioOS — Sistema de Ordens de Serviço para Técnicos de Refrigeração

Sistema web full-stack desenvolvido para ajudar técnicos autônomos (MEI) a organizar clientes, ordens de serviço e histórico financeiro, substituindo anotações em papel por uma solução digital simples e profissional.

Projeto criado como PEX (Projeto de Experiência) com foco em impacto real em pequenos negócios.

## 🚀 Problema

Técnicos de refrigeração geralmente:

anotam serviços no papel/WhatsApp

perdem histórico de clientes

esquecem valores recebidos

não têm controle financeiro

não geram comprovantes

Isso gera:

❌ desorganização

❌ retrabalho

❌ perda de dinheiro

❌ pouca credibilidade

## ✅ Solução

O FrioOS centraliza tudo em um único sistema:

`👤 cadastro de clientes`

`📋 ordens de serviço digitais`

`🔄 controle de status`

`💰 registro de valores`

`📄 geração de PDF`

`📊 relatórios mensais`

`🟣 persistência em banco de dados`

# 🧠 Arquitetura do Projeto
## 🟢 Frontend (React)

Interface do usuário

React + Vite + TypeScript


Responsável por:

telas

formulários

navegação

consumo da API

## 🔵 Backend (Node + Express)

API REST

Responsável por:

regras de negócio

validações

endpoints HTTP

comunicação com banco

## 🟣 Banco de Dados (SQLite)

Persistência local

Responsável por:

salvar clientes

salvar ordens de serviço

histórico permanente

## 🔄 Fluxo da aplicação
Frontend → API → Service → Database → Response → Frontend

## 🛠️ Tecnologias
Frontend

React

Vite

TypeScript

React Router

Axios

Backend

Node.js

Express

TypeScript

SQLite

## 📂 Estrutura de Pastas
🟢 Frontend
src/
 ├─ pages/
 ├─ components/
 ├─ routes/
 ├─ services/
 ├─ types/
 └─ App.tsx

🔵 Backend
src/
 ├─ server.ts
 ├─ routes/
 ├─ controllers/
 ├─ services/
 ├─ models/
 └─ database/
      ├─ connection.ts
      ├─ schema.ts
      └─ db.ts

# ▶️ Como rodar o projeto
## 🟢 Frontend
npm install
npm run dev


Acesse:

`http://localhost:5173`

## 🔵 Backend
cd frioos-backend
npm install
npm run dev


Acesse:

`http://localhost:3333`

##📡 Endpoints da API
Listar clientes
GET /api/clients

Criar cliente
POST /api/clients


Body:

``` json
{
  "nome": "João",
  "telefone": "99999-9999",
  "endereco": "Rua A"
}
```

## 🧩 Conceitos aplicados (aprendizado)

Este projeto foi construído para praticar:

arquitetura MVC

separação de responsabilidades

CRUD completo

REST API

integração Front ⇄ Back

SQLite

TypeScript full-stack

## 💡 Impacto real

Benefícios para o técnico:

organização profissional

histórico de clientes

controle financeiro

menos erros

mais credibilidade

economia de tempo

## 📌 Próximas melhorias

autenticação/login

geração de PDF

dashboard com gráficos

controle de estoque

versão mobile

deploy em nuvem

## 🤝 Contribuição

Sinta-se livre para abrir:

issues

sugestões

melhorias

## 📄 Licença

`MIT`
