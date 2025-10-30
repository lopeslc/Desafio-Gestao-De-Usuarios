# 🧩 Sistema de Gestão de Usuários  
> Projeto Fullstack desenvolvido com **.NET 8**, **Angular 18** e **SQL Server**  
> Autenticação JWT • CRUD Completo • Perfis (Admin/User) • Recuperação de Senha

![.NET](https://img.shields.io/badge/.NET%208-512BD4?style=for-the-badge&logo=dotnet&logoColor=white)
![Angular](https://img.shields.io/badge/Angular%2018-DD0031?style=for-the-badge&logo=angular&logoColor=white)
![SQLServer](https://img.shields.io/badge/SQL%20Server-CC2927?style=for-the-badge&logo=microsoftsqlserver&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)
![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)

---

## 📚 Sumário
1. [📘 Visão Geral](#-visão-geral)  
2. [🧠 Funcionalidades Principais](#-funcionalidades-principais)  
3. [⚙️ Tecnologias](#️-tecnologias)  
4. [🗄️ Banco de Dados](#️-banco-de-dados)  
5. [🚀 Como Executar](#-como-executar)  
6. [🔑 Fluxo de Autenticação](#-fluxo-de-autenticação)  
7. [📬 Endpoints Principais](#-endpoints-principais)  
8. [💡 Comandos Rápidos](#-comandos-rápidos)  
9. [👨‍💻 Autor](#-autor)

---

## 📘 Visão Geral

O **Sistema de Gestão de Usuários** é uma aplicação **fullstack** para **autenticação, cadastro e gerenciamento de usuários**, com níveis de acesso diferenciados entre **Administradores** e **Usuários comuns**.

Inclui fluxo completo de **“Esqueci minha senha”**, uso de **JWT** para autenticação e uma interface moderna construída em Angular.

---

## 🧠 Funcionalidades Principais

✅ Login e autenticação com JWT  
✅ CRUD completo de usuários  
✅ Perfis de acesso (Admin/User)  
✅ Rotas protegidas no frontend  
✅ Fluxo “Esqueci minha senha” + token  
✅ Documentação interativa via Swagger  

---

## ⚙️ Tecnologias

| Categoria | Tecnologias |
|------------|--------------|
| **Backend** | .NET 8 • Minimal APIs • BCrypt • JWT • Swagger/OpenAPI |
| **Frontend** | Angular 18 • Standalone Components • HttpClient + Interceptor JWT |
| **Banco de Dados** | SQL Server |
| **Outros** | TypeScript • SCSS • Fetch API |

---

## 🗄️ Banco de Dados

Crie o banco no **SQL Server** com o script abaixo 👇

```sql
USE master;
CREATE DATABASE db_britech;
GO
USE db_britech;
GO

CREATE TABLE Users (
    Email VARCHAR(100) COLLATE Latin1_General_CI_AS PRIMARY KEY,
    SenhaHash VARCHAR(255) NOT NULL,
    Nome VARCHAR(100) NOT NULL,
    IsAdmin BIT NOT NULL DEFAULT 0,
    ManagerEmail VARCHAR(100) NULL
        REFERENCES Users(Email)
        ON DELETE NO ACTION ON UPDATE NO ACTION
);

CREATE TABLE PasswordResets (
    Token UNIQUEIDENTIFIER PRIMARY KEY,
    Email VARCHAR(100) COLLATE Latin1_General_CI_AS NOT NULL
        REFERENCES Users(Email)
        ON DELETE CASCADE ON UPDATE NO ACTION,
    ExpiresAt DATETIME2 NOT NULL
);

CREATE INDEX IX_PasswordResets_Email ON PasswordResets(Email);
GO
```

---

## 🚀 Como Executar

### 🔹 1. Backend (.NET)
```bash
cd backend
dotnet restore
dotnet build
dotnet run --project Projeto.Api
```

📍 Swagger: [http://localhost:5275/swagger](http://localhost:5275/swagger)

> ⚙️ **Crie o admin inicial**
> - Endpoint: `POST /dev/seed-admin`  
> - Credenciais:
>   - Email: `admin@local`
>   - Senha: `Admin@123`

---

### 🔹 2. Frontend (Angular)
```bash
cd frontend/angular-app
npm install
ng serve -o
```

📍 Acesse: [http://localhost:4200](http://localhost:4200)

> O frontend conecta-se automaticamente ao backend via `environment.ts`.

---

## 🔑 Fluxo de Autenticação

1️⃣ **Login** → Recebe token JWT  
2️⃣ **Guarda token** no `localStorage`  
3️⃣ **Interceptor** adiciona o token no cabeçalho das requisições  
4️⃣ **Guards** bloqueiam acesso de usuários não autorizados  
5️⃣ **Logout** limpa o token e redireciona ao login

---

## 📬 Endpoints Principais

| Método | Endpoint | Descrição | Auth |
|:------:|-----------|------------|:----:|
| POST | `/auth/login` | Autentica usuário | ❌ |
| POST | `/auth/register` | Cria novo usuário | ✅ Admin |
| GET | `/me` | Perfil logado | ✅ |
| GET | `/users` | Lista usuários | ✅ Admin |
| PUT | `/users/{email}` | Atualiza usuário | ✅ Admin |
| DELETE | `/users/{email}` | Remove usuário | ✅ Admin |
| POST | `/auth/forgot` | Gera token de redefinição | ❌ |
| POST | `/auth/reset` | Redefine senha com token | ❌ |

---

## 💡 Comandos Rápidos

| Ação | Comando |
|------|----------|
| Restaurar pacotes | `dotnet restore` |
| Compilar backend | `dotnet build` |
| Rodar API | `dotnet run --project Projeto.Api` |
| Instalar Angular CLI | `npm i -g @angular/cli` |
| Instalar dependências do front | `npm install` |
| Rodar frontend | `ng serve -o` |

---

## 👨‍💻 Autor

**Luan Lopes**  
📚 Ciência da Computação — Instituto Mauá de Tecnologia  
💼 Projeto Acadêmico — *Desafio Britech: Sistema de Gestão de Usuários*
