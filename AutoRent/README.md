# AutoRent — Sistema de Aluguel de Carros

**Disciplina:** Desenvolvimento de Interfaces Web (DIW)  
**Atividade:** LAB02 — Laboratório 02 (15 pontos)  
**Professor:** João Paulo Carneiro Aramuni

## Descrição
Protótipo acadêmico de gestão de pedidos de aluguel de automóveis, desenvolvido com HTML5, CSS3, JavaScript, Bootstrap 5, Fetch API e JSON Server. A modelagem está em `modelagem/`.

## Execução
1. Instale Node.js e abra esta pasta no VS Code.
2. No terminal desta pasta, execute `npx json-server@0.17.4 --watch db.json --port 3000`.
3. Mantenha o terminal aberto. Confira `http://localhost:3000/clientes`.
4. Abra `index.html` usando **Live Server** no VS Code (ou outro servidor estático local).
5. Selecione um cliente ou agente em **Acesso ao sistema** e clique **Entrar**. Você também pode cadastrar um cliente pelo link abaixo do seletor.
6. Para analisar pedidos, entre como agente. Para criar pedidos, entre como cliente.

## Funcionalidades
- Cadastro de clientes com nome, CPF, RG, endereço, profissão e até 3 empregadores/rendimentos.
- CRUD de clientes; consulta de automóveis e cadastro/edição de automóveis por agentes.
- Pedidos: criação, consulta, alteração, cancelamento e acompanhamento de status.
- Agentes (empresa e banco): avaliação com parecer e aprovação/rejeição.
- Contratos de aluguel e crédito vinculados a pedidos aprovados; crédito exige agente bancário.
- Persistência via API REST (`GET`, `POST`, `PATCH`, `DELETE`) no `db.json`.

## Rotas da API
`/clientes`, `/agentes`, `/automoveis`, `/pedidos`, `/contratos`.

## Organização
- `index.html`: interface e formulários.
- `css/style.css`: identidade visual responsiva.
- `js/app.js`: requisições REST, CRUD, eventos, validações e renderização.
- `db.json`: dados iniciais de demonstração.
- `modelagem/`: histórias de usuário, requisitos e diagramas UML em SVG e PNG, além dos arquivos DOT de origem.

## Limitações conhecidas / escopo de protótipo
- **Não há autenticação real**: o seletor de usuário simula o acesso; não utilizar dados reais ou sensíveis. CPF de exemplo é fictício e a validação verifica apenas 11 dígitos.
- A autorização é demonstrativa no navegador, não protegida por servidor. Não é adequado para produção.
- Não há integração real com bancos, cobrança ou assinatura digital; aprovação financeira é manual e simulada.
- Não há verificação de conflito de reservas ou disponibilidade do veículo por período.
- Contratos e propriedade são representados por registros e referências; não há emissão de documento jurídico.
- A exclusão de cliente/automóvel com pedidos associados é bloqueada na interface para preservar referências.
- O enunciado não define regras completas de negócio; as decisões de interface e de modelagem são propostas para o laboratório.

## Referência do enunciado
DIW — LABORATÓRIO 02 — Sistema de Aluguel de Carros (PDF fornecido pelo professor). Template de README recomendado: https://github.com/joaopauloaramuni/desenvolvimento-de-interfaces-web/blob/main/TEMPLATES/template_README.md

## Apresentação
Demonstre cadastro de cliente, criação de pedido, entrada como agente, emissão de parecer, visualização de status e registro de contrato. Compare a implementação com os diagramas e explique os limites do protótipo.
