# Financial Visibility Angular MFE

Microfrontend Angular responsavel pela visualizacao financeira do usuario. Ele foi criado para ser consumido por um shell Next.js/React, mas permanece isolado como aplicacao Angular independente.

## Papel Na Arquitetura

Este projeto e um MFE de visualizacao financeira. O shell Next.js e responsavel por:

- autenticacao e sessao do usuario;
- roteamento principal da aplicacao;
- estado global da conta via Redux;
- carga remota do MFE;
- envio dos dados financeiros para o Web Component.

Este MFE Angular e responsavel por:

- registrar o Web Component `<mcintosh-financial-visibility>`;
- receber dados financeiros vindos do shell;
- renderizar o grafico de visibilidade financeira;
- emitir eventos para o shell quando houver interacao do usuario.

O desenho fica assim:

```txt
Shell Next.js/React
  Redux account state
    balance + transactions
        |
        v
  financialVisibilityData
        |
        v
  <mcintosh-financial-visibility>
        |
        v
Angular MFE
  @Input setter
  ngx-charts
  @Output event
```

## Client-Side Render

Este MFE e carregado somente no client-side.

O motivo e que a integracao depende de APIs de navegador, como:

- `window`;
- `customElements`;
- Web Components;
- carregamento dinamico do remote entry.

Por isso, o shell Next.js nao deve importar esse MFE em Server Components. O host deve carregar o remote entry e registrar o Web Component dentro de um componente client-side.

## Deploy

Os arquivos estaticos deste MFE sao gerados pelo build Angular e publicados em um bucket S3. A entrega publica dos assets e feita via CloudFront.

Remote entry publicado:

[https://d102z2e77k7t5v.cloudfront.net/remoteEntry.json](https://d102z2e77k7t5v.cloudfront.net/remoteEntry.json)

Remote entry local:

```txt
http://localhost:4201/remoteEntry.json
```

## Por Que Native Federation

Este projeto usa `@angular-architects/native-federation`.

A escolha foi feita porque as versoes modernas do Angular usam um builder baseado em esbuild, e nao mais uma arquitetura centrada em webpack. O Module Federation tradicional nasceu no ecossistema webpack; ja o Native Federation oferece uma abordagem mais alinhada com Angular moderno, usando padroes nativos da web, como ES Modules e import maps.

Na pratica, ele cumpre o mesmo papel arquitetural esperado do Module Federation:

- publicar um remote entry;
- expor modulos remotos;
- permitir que um shell carregue o MFE sob demanda;
- manter deploy e runtime independentes entre shell e remote.

Configuracao principal:

```txt
Remote name: financialVisibilityMfe
Remote entry: /remoteEntry.json
Modulo exposto: ./register
Web Component: <mcintosh-financial-visibility>
```

## Contrato Do Web Component

### Tag Exposta

```html
<mcintosh-financial-visibility></mcintosh-financial-visibility>
```

### Input

O input principal e `financialVisibilityData`.

Ele e recebido como propriedade JavaScript, nao como string em atributo HTML:

```ts
element.financialVisibilityData = financialVisibilityData;
```

No Angular, esse input e implementado como setter:

```ts
@Input()
set financialVisibilityData(value: FinancialVisibilityData | undefined) {
  this._financialVisibilityData = value;
  this.onFinancialVisibilityDataChange(value);
}
```

Isso permite que o MFE reaja toda vez que o shell atribuir novos dados vindos do Redux.

### Shape Do Input

```ts
export type TransactionType = 'DEPOSIT' | 'TRANSFER';

export interface FinancialVisibilityTransaction {
  id: number;
  type: TransactionType;
  date: string;
  value: number;
}

export interface FinancialVisibilityData {
  balance: number;
  depositsTotal: number;
  transfersTotal: number;
  transactions: FinancialVisibilityTransaction[];
}
```

Quando `depositsTotal` e `transfersTotal` forem zero, o MFE nao renderiza grafico nem legenda.

### Customer Id

O componente tambem aceita `customer-id` como atributo:

```html
<mcintosh-financial-visibility customer-id="123"></mcintosh-financial-visibility>
```

No Angular:

```ts
@Input() customerId?: string;
```

### Output

O MFE emite o evento `visibilityItemSelected` quando o usuario seleciona um item do grafico.

No Angular:

```ts
@Output() visibilityItemSelected = new EventEmitter<unknown>();
```

No shell:

```ts
element.addEventListener('visibilityItemSelected', (event) => {
  const detail = (event as CustomEvent).detail;
  console.log(detail);
});
```

## Consumo Pelo Shell Next.js

Exemplo conceitual de consumo no shell:

```ts
await initFederation({
  financialVisibilityMfe: 'https://d102z2e77k7t5v.cloudfront.net/remoteEntry.json',
});

await loadRemoteModule('financialVisibilityMfe', './register');
```

Depois do Web Component estar registrado:

```ts
element.setAttribute('customer-id', '123');
element.financialVisibilityData = financialVisibilityData;
```

O shell atualiza `financialVisibilityData` sempre que o estado Redux da conta muda.

## Desenvolvimento Local

Instale as dependencias:

```bash
npm install
```

Suba o MFE:

```bash
npm start
```

A aplicacao fica disponivel em:

```txt
http://localhost:4201
```

Remote entry local:

```txt
http://localhost:4201/remoteEntry.json
```

## Build

```bash
npm run build
```

O build gera os arquivos em:

```txt
dist/app/browser
```

O `remoteEntry.json` fica em:

```txt
dist/app/browser/remoteEntry.json
```

## Testes

```bash
npm test -- --watch=false
```

## Docker Com Nginx

Este projeto tambem possui uma configuracao Docker para servir os assets Angular via Nginx.

Build da imagem:

```bash
docker build -t financial-visibility-mfe-nginx .
```

Rodando localmente:

```bash
docker run --rm -p 4201:80 financial-visibility-mfe-nginx
```

Acesse:

```txt
http://localhost:4201
http://localhost:4201/remoteEntry.json
```

## Resumo

Este MFE e uma aplicacao Angular moderna, exposta via Native Federation e consumida por um shell Next.js/React. A comunicacao entre shell e MFE acontece por contrato de Web Component: dados entram por input JavaScript com setter, e interacoes saem por evento customizado.
