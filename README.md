# RentUp — Don't buy, rent.

> Plataforma de aluguer peer-to-peer entre particulares, organizada por regiões geográficas em Portugal.

![RentUp](https://img.shields.io/badge/versão-v2-blue) ![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange) ![Licença](https://img.shields.io/badge/licença-MIT-green)

---

## 📖 Sobre o projeto

A **RentUp** é uma startup de economia circular que permite alugar objetos do quotidiano entre particulares. Em vez de comprar uma furadeira para usar uma hora, aluga-a por €8/dia. Em vez de deixares a tua bicicleta parada, ganha dinheiro com ela.

O projeto foi desenvolvido no âmbito da unidade curricular de **Modelação e Análise de Sistemas (MAS)** — Universidade de Aveiro.

### O que nos diferencia

| | OLX | Peerby | **RentUp** |
|---|---|---|---|
| Modelo | Compra/venda | Empréstimo gratuito | **Aluguer pago** |
| Pagamentos | Externo | Não tem | **Integrado (MB Way)** |
| Calendário | Não tem | Não tem | **✅ Incluído** |
| Avaliações por região | Não tem | Não tem | **✅ Incluído** |

---

## ✨ Funcionalidades

- 🔍 **Pesquisa e filtros** por categoria, região e preço
- 📅 **Calendário de reservas** com datas disponíveis/ocupadas
- ⭐ **Sistema de avaliações** mútuas (1–5 estrelas + comentário)
- 🗺️ **Organização por regiões** — 18 distritos de Portugal Continental
- ❤️ **Favoritos** guardados por utilizador
- 🌙 **Modo escuro**
- 📱 **Design responsivo** para mobile
- 👤 **Edição de perfil** com foto
- 📧 **Verificação de email** simulada no registo
- 🏆 **Top Regiões** por avaliação

---

## 🎭 Atores do sistema

| Ator | Descrição |
|---|---|
| **Cliente** | Pesquisa, reserva e paga objetos; avalia o Dono após devolução |
| **Dono** | Lista objetos, gere disponibilidade, aceita/recusa reservas; avalia o Cliente |
| **Administrador** | Modera conteúdo, gere utilizadores e gera relatórios |
| **Sistema de Pagamentos** | Processa pagamentos via MB Way (externo) |

---

## 📋 Casos de utilização implementados

| UC | Descrição | Estado |
|---|---|---|
| UC01 | Registar e configurar perfil | ✅ |
| UC02 | Pesquisar objetos disponíveis | ✅ |
| UC03 | Reservar objeto | ✅ |
| UC05 | Avaliar transação (1–5 ⭐) | ✅ |
| UC06 | Listar objeto para aluguer | ✅ |
| UC07 | Gerir disponibilidade (calendário) | ✅ |

---

## 🛠️ Tecnologias

- **HTML5 / CSS3 / JavaScript** — sem frameworks, vanilla puro
- **Leaflet.js + OpenStreetMap** — mapa com pin do distrito no detalhe do anúncio
- **LocalStorage** — persistência de dados no cliente (protótipo)
- **Vercel** — deploy contínuo via GitHub

---

## 🚀 Como correr localmente

```bash
git clone git@github.com:fl4me100/RentUp.git
cd RentUp
```

Abre o ficheiro `index.html` diretamente no browser — não é necessário servidor.

Ou usa a extensão **Live Server** no VS Code para hot reload.

### 🌐 Demo online

👉 **[rentup.vercel.app](https://rentup.vercel.app)** *(substituir pelo link real)*

---

## 📁 Estrutura do projeto

```
RentUp/
├── index.html       # Estrutura e modais da app
├── style.css        # Estilos (inclui modo escuro, responsivo)
├── script.js        # Toda a lógica de negócio e UI
└── logo_rentup.png  # Logo da marca
```

---

## 📐 Modelo do domínio

As principais entidades do sistema são:

- **Utilizador** — base para Cliente e Dono; tem perfil, região e avaliação média
- **Listagem** — objeto disponibilizado pelo Dono com preço, categoria e calendário
- **Reserva** — compromisso de aluguer para um período; ligada a um Pagamento
- **Avaliação** — classificação mútua após cada reserva; alimenta a reputação regional
- **Região** — agrega Utilizadores e Listagens por distrito

---

## 👥 Equipa

| Nome | Nº de aluno |
|---|---|
| Afonso Alves | 132403 |
| Diogo Arede | 132465 |
| Nuno Gomes | 132055 |
| Rafael Simão Lopes | 131900 |

**Unidade curricular:** 40431 — Modelação e Análise de Sistemas  
**Instituição:** Universidade de Aveiro  
**Ano letivo:** 2025/2026

---

## 📄 Documentação

O documento SRS completo (E4) está disponível na pasta do projeto e inclui:
- 11 casos de utilização detalhados
- Regras de negócio (BR-01 a BR-10)
- Requisitos não funcionais (RNF-01 a RNF-07)
- Diagrama de classes do domínio
- Roadmap de desenvolvimento em 6 épicos
