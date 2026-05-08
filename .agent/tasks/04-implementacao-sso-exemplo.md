# Task 04: Exemplo de Implementação de SSO / OAuth2

## Contexto
O projeto e a documentação mencionam "SSO Ready: Built-in OAuth2/OIDC structure", mas para que os usuários sintam o real valor, é necessário um código de exemplo acionável.

## Objetivos
- Provar o conceito de Single Sign-On (SSO).
- Facilitar a implementação de autenticação moderna para os usuários do boilerplate.

## Itens de Ação
- [ ] Implementar um fluxo simulado de callback do Google/GitHub em `src/domain/auth` ou `src/domain/identity`.
- [ ] Mostrar a separação arquitetural recomendada no doc `identity-vs-credentials.md` (como o ID provider se comunica com o domínio interno).
- [ ] Criar testes unitários para a validação do token / payload OAuth2.

## Resultados Esperados
- Cumprimento da promessa "SSO Ready".
- Diminuição de perguntas recorrentes ou "issues" sobre como iniciar com autenticação usando a arquitetura proposta.
