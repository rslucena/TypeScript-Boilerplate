# Guia Rápido: Login Local (Email/Senha)

Este documento foi criado para demonstrar o passo a passo de como testar a nova funcionalidade de Login Local utilizando o endpoint `POST /api/v1/sso/local`. Como o boilerplate não tem uma rota explícita de criação de conta (apenos o CRUD do domínio `identity`), vamos usar o banco de dados e os endpoints existentes.

## 1. Subindo o Ambiente

Certifique-se de que o Redis e o PostgreSQL estão rodando através do docker-compose:
```bash
docker compose up -d
```

Em seguida, o servidor da aplicação em si, ou utilize o CLI/Swagger para fazer as chamadas as rotas da aplicação (ex: `bun run start` ou porta `:3000`).

## 2. Inserindo uma Identidade de Teste

Para logar, o usuário primeiro precisa existir na sua tabela `identity`. O UUID retornado no corpo da requisição será usado para vincular a credencial `local`.

**Requisição (Criando Identity):**
```http
POST /api/v1/identity
Content-Type: application/json
Accept-Language: pt-br

{
  "name": "Jane",
  "lastName": "Doe",
  "email": "jane@example.com"
}
```

Anote o **`id`** retornado na resposta acima (vamos chamá-lo de `IDENTITY_ID`).

## 3. Inserindo a Credencial de Senha 

Agora, vincule uma credencial do tipo `PASSWORD` apontado para essa `identity`. O sistema aceitará a requisição se você informar corretamente os dados do usuário. O endpoint do boilerplate processa a senha em texto limpo informada no campo respectivo (neste caso particular na `secret` key) e a converte para _hash_ automaticamente (através da `href`) antes de salvar no banco via rotas nativas se usadas, **mas na rota atual o correto é:**

**Requisição (Criando a Credencial vinculada a Identity):**
```http
POST /api/v1/credentials
Content-Type: application/json

{
  "identityId": "<O ID PEGO NO PASSO 2>",
  "type": "PASSWORD",
  "provider": "LOCAL",
  "subject": "jane@example.com",
  "secret": "MinhaSenhaSuperSegura123!",
  "login": "jane@example.com"
}
```

*Nota: Certifique-se de que a senha contenha no mínimo 8 caracteres de acordo com a regra da validação estabelecida (e atenda ao seu padrão de Zod configurado).*

## 4. Efetuando o Login

Com a Identidade e a Credencial `LOCAL` cadastradas, basta enviar as informações para nosso novo endpoint de SSO `POST /sso/local`. 

**Requisição (Acionando o Local Login):**
```http
POST /api/v1/sso/local
Content-Type: application/json

{
  "email": "jane@example.com",
  "password": "MinhaSenhaSuperSegura123!"
}
```

## Resposta Esperada

Se a requisição for fornecida com email e senha corretos, o servidor vai decodificar e comparar as senhas e devolver uma resposta modelo com as configurações providas de identidade para emissão dos Token JWTs:

```json
{
  "session": {
    "id": "<IDENTITY_ID>",
    "name": "Jane"
  },
  "token": "ey.....<SEU JWT AKI>....."
}
```

## Como Testar Cenários de Erro?
- Tente logar com `"email": "naoexiste@example.com"`. O retorno deve ser **`401 ERR_UNAUTHORIZED`**.
- Tente logar com uma senha errada (`"password": "senhaErrada123!"`). O retorno também deve ser **`401 ERR_UNAUTHORIZED`**.
- Envie uma senha muito curta (por exemplo `"password": "123"`). O retorno será **`400 ERR_REQUEST`** (Bad Request / Erro de Validação de Schema).
