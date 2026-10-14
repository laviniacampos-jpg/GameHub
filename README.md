# GameHub — desafio de desempenho (PostgreSQL)

Projeto didático full stack para investigar gargalos de desempenho em uma loja de games. O sistema deve continuar funcional; a atividade é descobrir por que ele fica lento e melhorar sem remover funcionalidades.

## Preparar o banco
1. No pgAdmin, crie o banco gamehub se ele ainda não existir:

```sql
CREATE DATABASE gamehub;
```

Arquivo .env:

```env
PORT=3001
DATABASE_URL=postgresql://postgres:admin@localhost:5432/gamehub
JWT_SECRET=troque-por-um-segredo-aleatorio-longo
```

Se usuário, senha, host ou porta forem diferentes, ajuste a URL. Caracteres especiais na senha precisam ser codificados para URL.

## Instalar e executar
Na pasta principal:

Comandos Terminal 

npm install
npm run install:all
npm run init-db
npm run dev

- Front-end: http://localhost:3000
- API: http://localhost:3001/api/health
- Login administrador: admin@gamehub.local / 123456
- Login aluno: aluno@gamehub.local / 123456
- Registro de novas contas: http://localhost:3000/register (novas contas recebem o papel de aluno)

O login é feito por `POST /api/auth/login` e o cadastro por `POST /api/auth/register`. Ambos retornam um JWT com validade de 8 horas; operações de criação e exclusão de produtos exigem um token de administrador. Defina um `JWT_SECRET` aleatório e exclusivo fora do ambiente local de demonstração.

## Missão
A aplicação foi entregue com gargalos de desempenho e dois bugs funcionais intencionais. Identifique e corrija os problemas sem remover funcionalidades. A base-alvo agora é de 60.000 produtos: o catálogo envia a coleção inteira, a página monta milhares de componentes, a busca faz requisição a cada tecla, a consulta de listagem é executada duas vezes e o dashboard percorre a tabela em consultas sequenciais. Os índices de nome/categoria também são removidos pelo inicializador, inclusive quando você reutiliza um banco de uma versão anterior. Investigue usando DevTools (Network e Performance), logs do back-end e medições. Observe também o que acontece depois de cadastrar ou excluir um produto: o catálogo completo é solicitado e renderizado novamente. Ao abrir o catálogo, espere a primeira carga terminar e confira quantos cartões existem no DOM. Em computador mais forte, use a aba Performance do DevTools e compare o tempo de scripting/renderização; o número de milissegundos varia conforme a máquina.


Além dos gargalos de desempenho, há dois bugs funcionais escondidos :Um relacionado ao filtro por categoria e outro à ordenação por preço. Reproduza cada comportamento, encontre a causa no código e registre o teste de regressão antes de corrigir.
