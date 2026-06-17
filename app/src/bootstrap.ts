import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { App } from './app/app';

const ELEMENT_NAME = 'mcintosh-financial-visibility';

async function registerMicrofrontendElement(): Promise<void> {
  if (customElements.get(ELEMENT_NAME)) {
    return;
  }

  const app = await createApplication(appConfig);
  const element = createCustomElement(App, {
    injector: app.injector,
  });

  customElements.define(ELEMENT_NAME, element);
}

registerMicrofrontendElement().catch((err) => console.error(err));
