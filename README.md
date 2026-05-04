## Inicio de um novo projeto!

useCaseDiagram
    actor "Usuário Comum" as U
    actor "Casal / Parceiro" as C
    actor "Chatbot (Telegram/Whats)" as B

    package "Financial Management System" {
        usecase "Autenticar no Sistema (JWT)" as UC1
        usecase "Cadastrar Transação (Débito/Crédito)" as UC2
        usecase "Gerenciar Contas Compartilhadas" as UC3
        usecase "Visualizar Dashboard de Gastos" as UC4
        usecase "Definir Metas e Orçamentos" as UC5
        usecase "Receber Alertas de Limite" as UC6
        usecase "Registrar Gasto via Bot" as UC7
    }

    U --> UC1
    U --> UC2
    U --> UC4
    U --> UC5
    
    C --> UC3
    C --> UC4
    
    B --> UC7
    UC6 --> B
    UC7 ..> UC2 : <<include>>