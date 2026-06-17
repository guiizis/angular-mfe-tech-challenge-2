# Financial Visibility Angular MFE

Microfrontend Angular exposto para um host Next.js/React.

## Arquitetura

- **Framework do MFE:** Angular 22.
- **Host esperado:** Next.js/React.
- **Federation:** `@angular-architects/native-federation`, compatível com o builder moderno do Angular baseado em esbuild.
- **Integração visual:** Web Component via `@angular/elements`.
- **Tag exposta:** `<mcintosh-financial-visibility></mcintosh-financial-visibility>`.
- **Remote name:** `financialVisibilityMfe`.
- **Remote entry local:** `http://localhost:4201/remoteEntry.json`.
- **Modulo exposto:** `./register`.

O host Next.js fica responsavel pelo roteamento macro, por exemplo `/visibilidade-financeira`.
O microfrontend Angular fica encapsulado dentro dessa rota. Caso o MFE precise de rotas internas, ele usa hash routing para evitar conflito com as rotas do Next.

## Desenvolvimento

```bash
npm install --legacy-peer-deps
npm start
```

O servidor local sobe em:

```txt
http://localhost:4201
```

## Build

```bash
npm run build
```

O build gera o `remoteEntry.json` em:

```txt
dist/app/browser/remoteEntry.json
```

## Contrato de comunicacao

Entrada do host para o MFE:

```html
<mcintosh-financial-visibility customer-id="123"></mcintosh-financial-visibility>
```

Saida do MFE para o host:

```ts
element.addEventListener('visibilityItemSelected', (event) => {
  console.log(event.detail);
});
```

## Exemplo de consumo no Next.js

No host Next.js, carregue esse MFE apenas no client side.

```tsx
'use client';

import { useEffect, useRef } from 'react';
import { initFederation, loadRemoteModule } from '@angular-architects/native-federation';

export function FinancialVisibilityMfe() {
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let active = true;

    async function loadMfe() {
      await initFederation({
        financialVisibilityMfe: 'http://localhost:4201/remoteEntry.json',
      });

      await loadRemoteModule('financialVisibilityMfe', './register');

      if (!active || !elementRef.current) {
        return;
      }

      elementRef.current.setAttribute('customer-id', '123');
    }

    loadMfe().catch(console.error);

    const element = elementRef.current;
    const onSelected = (event: Event) => {
      console.log((event as CustomEvent).detail);
    };

    element?.addEventListener('visibilityItemSelected', onSelected);

    return () => {
      active = false;
      element?.removeEventListener('visibilityItemSelected', onSelected);
    };
  }, []);

  return <mcintosh-financial-visibility ref={elementRef} />;
}
```

Para TypeScript aceitar a tag no React, adicione uma declaracao global no host:

```ts
declare namespace JSX {
  interface IntrinsicElements {
    'mcintosh-financial-visibility': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    >;
  }
}
```

