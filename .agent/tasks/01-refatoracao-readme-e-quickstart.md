# Task 01: Refatoração do README e Quick Start

## Contexto
O README atualmente menciona `Vite` como a ferramenta de build do projeto, o que gera confusão, já que o Vite é utilizado apenas para o VitePress (documentação). A aplicação em si usa `tsup` (ou build nativo do Bun). Além disso, o Quick Start instrui o uso de `git clone`, o que é um padrão mais antigo, enquanto o Bun oferece o comando nativo `bun create`.

## Objetivos
- Remover fricções iniciais para novos desenvolvedores reduzindo o número de passos do Quick Start.
- Alinhar as tecnologias listadas nas "Core Features" com a realidade da aplicação backend.

## Itens de Ação
- [ ] Substituir o bloco de `git clone` no README pelo comando `bun create rslucena/TypeScript-Boilerplate my-api`.
- [ ] Remover a menção do "Vite (Quick builds and HMR)" das ferramentas da API, substituindo por uma menção correta ao `tsup` ou ferramenta de build.
- [ ] Adicionar um parágrafo claro sobre o uso do Vite apenas na seção de Documentação (VitePress).

## Resultados Esperados
- Diminuição do "Time to First Hello World" (TTFHW) e maior adoção inicial.
- Clareza técnica para desenvolvedores sêniores que analisam o repositório.
