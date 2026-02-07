# 📌 Lead Manager — CRUD de Leads + Endereços

Aplicação front-end desenvolvida em **HTML, CSS e JavaScript puro (Vanilla JS)** com foco em **arquitetura baseada em estado, renderização dinâmica do DOM e persistência local**.

O sistema permite gerenciar **Leads e múltiplos Endereços (relação 1:N)** com integração à **API ViaCEP** para autopreenchimento de dados de endereço.

---

## 🚀 Funcionalidades

### Leads

* Criar lead
* Editar lead (inline)
* Excluir lead
* Selecionar lead ativo

### Endereços

* Múltiplos endereços por lead
* CRUD completo
* Busca automática de CEP (ViaCEP API)
* Validação de campos obrigatórios

### Sistema

* Estado centralizado (Single Source of Truth)
* Renderização dinâmica do DOM
* Persistência com localStorage
* Validação de e-mail, telefone e CEP
* Interface responsiva e moderna

---

## 🧠 Conceitos aplicados

* Manipulação de DOM sem frameworks
* Arquitetura **estado → render → UI**
* Programação funcional (validações puras)
* Async/Await + Fetch API
* LocalStorage (persistência offline)
* Componentização visual com CSS

---

## 🛠️ Tecnologias

* HTML5
* CSS3
* JavaScript ES6+
* ViaCEP REST API

---

## 📂 Estrutura

```
/index.html
/script.js
/CSS/style.css
```

---

## ▶️ Como executar

Clone o repositório e abra:

```
index.html
```

Recomendado usar **Live Server**.

---

## 🎯 Objetivo do projeto

Praticar fundamentos de **JavaScript puro**, lógica de CRUD, organização de estado, consumo de API externa e construção de interfaces sem frameworks.

---

## 🔮 Melhorias futuras

* Máscaras de input
* Filtros/busca de leads
* Drag & drop Kanban
* Modularização do código
* Testes unitários

