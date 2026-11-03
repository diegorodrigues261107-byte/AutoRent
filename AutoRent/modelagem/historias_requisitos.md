# Histórias de usuário e requisitos — AutoRent

## Histórias de usuário
1. Como visitante, quero cadastrar meus dados, para utilizar o sistema.
2. Como cliente, quero atualizar meus dados pessoais, para mantê-los corretos.
3. Como cliente, quero consultar automóveis, para escolher um veículo.
4. Como cliente, quero solicitar um aluguel com período definido, para reservar um automóvel.
5. Como cliente, quero consultar o status do pedido, para acompanhar a avaliação.
6. Como cliente, quero modificar ou cancelar meu pedido, para ajustar meus planos.
7. Como agente, quero analisar financeiramente pedidos, para registrar uma decisão.
8. Como agente bancário, quero associar crédito a contrato aprovado, para registrar o financiamento.
9. Como agente, quero gerenciar o catálogo de automóveis, para manter os dados atualizados.

## Requisitos funcionais
- RF01: O sistema deve permitir cadastro prévio de clientes.
- RF02: O sistema deve permitir consulta, alteração e exclusão de clientes.
- RF03: O sistema deve armazenar RG, CPF, nome, endereço e profissão do cliente.
- RF04: O sistema deve permitir registrar até três empregadores e respectivos rendimentos.
- RF05: O sistema deve manter matrícula, ano, marca, modelo e placa dos automóveis.
- RF06: O sistema deve permitir criar, consultar, modificar e cancelar pedidos de aluguel.
- RF07: O sistema deve exibir o status dos pedidos.
- RF08: O sistema deve permitir que agentes registrem parecer financeiro e aprovem ou rejeitem pedidos.
- RF09: O sistema deve representar contratos de aluguel e crédito bancário.
- RF10: O sistema deve registrar o tipo de proprietário do automóvel (cliente, empresa ou banco).

## Requisitos não funcionais
- RNF01: A interface deve utilizar Bootstrap 5 e ser responsiva.
- RNF02: A lógica deve utilizar JavaScript e Fetch API.
- RNF03: Os dados devem persistir em JSON Server a partir de `db.json`.
- RNF04: O repositório deve incluir modelos UML, código e README.

## Regras de negócio adotadas no protótipo
- RN01: O cliente pode registrar até 3 vínculos de emprego.
- RN02: Somente pedidos aprovados podem originar contratos.
- RN03: Um contrato de crédito precisa identificar um agente do tipo banco.
- RN04: Um pedido cancelado não pode ser avaliado.
- RN05: O acesso por perfil é simulado e não constitui autenticação real.
