# RentUp — Don't buy, rent.

> Plataforma de aluguer peer-to-peer entre particulares, organizada por regiões geográficas em Portugal.

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

## 👥 Equipa

| Afonso Alves | Diogo Arede | Nuno Gomes | Rafael Simão Lopes |
|---|---|---|---|

**Unidade curricular:** Modelação e Análise de Sistemas  
**Instituição:** Universidade de Aveiro  
**Ano letivo:** 2025/2026
