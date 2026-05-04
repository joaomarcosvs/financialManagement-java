## Inicio de um novo projeto!

### Diagrama de uso

Fonte editavel em draw.io: [docs/diagrama-casos-de-uso.drawio](docs/diagrama-casos-de-uso.drawio)

```mermaid
flowchart LR
    U[Usuario Comum]
    C[Casal / Parceiro]
    B[Chatbot<br/>(Telegram/WhatsApp)]

    subgraph FMS[Financial Management System]
        UC1([Autenticar no Sistema<br/>(JWT)])
        UC2([Cadastrar Transacao<br/>(Debito/Credito)])
        UC3([Gerenciar Contas Compartilhadas])
        UC4([Visualizar Dashboard de Gastos])
        UC5([Definir Metas e Orcamentos])
        UC6([Receber Alertas de Limite])
        UC7([Registrar Gasto via Bot])
    end

    U --> UC1
    U --> UC2
    U --> UC4
    U --> UC5

    C --> UC3
    C --> UC4

    B --> UC7
    UC6 --> B
    UC7 -. <<include>> .-> UC2
```

Imagem exportada em SVG: [docs/diagrama-casos-de-uso.svg](docs/diagrama-casos-de-uso.svg)

![Diagrama de casos de uso](docs/diagrama-casos-de-uso.svg)