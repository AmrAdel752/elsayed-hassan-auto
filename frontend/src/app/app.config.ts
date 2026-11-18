import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { NavigationError, provideRouter, withComponentInputBinding, withInMemoryScrolling, withNavigationErrorHandler } from '@angular/router';
import { routes } from './app.routes';
import { I18n } from './core/i18n.service';
import { authInterceptor } from './core/auth.http';
import { contentChangeInterceptor } from './core/content-sync';

/**
 * The site is rebuilt after every dashboard change, and each build renames the page files. A tab opened
 * before the rebuild then can't download a page it hasn't opened yet, so clicking it did nothing.
 * Fix: open that page with a normal full load (it gets the new version). At most once a minute, so a
 * real outage never loops.
 */
function reloadOnStaleCode(e: NavigationError) {
  const msg = String((e.error as Error | undefined)?.message ?? e.error);
  if (!/dynamically imported module|Importing a module script failed|MIME type|Loading chunk|module script/i.test(msg)) return;
  try {
    const last = Number(sessionStorage.getItem('sha-reload') || 0);
    if (Date.now() - last < 60_000) return;
    sessionStorage.setItem('sha-reload', String(Date.now()));
  } catch { /* storage blocked: still reload once */ }
  const url = /https?:\/\/\S+?\.js/.exec(msg)?.[0];
  repairCache(url).finally(() => location.assign(e.url));
}

/**
 * A chunk asked for while Cloudflare was still deploying gets the HTML page back (status 200),
 * and the browser keeps that wrong copy for hours. Download the failing chunk and the chunks it
 * imports again, skipping the browser cache, so the reload gets the real files.
 */
async function repairCache(first?: string) {
  if (!first || new URL(first).origin !== location.origin) return;
  const seen = new Set<string>(), todo = [first];
  while (todo.length && seen.size < 40) {
    const u = todo.pop()!;
    if (seen.has(u)) continue;
    seen.add(u);
    try {
      const text = await (await fetch(u, { cache: 'reload' })).text();
      for (const m of text.matchAll(/from"\.\/([\w-]+\.js)"/g)) todo.push(new URL(m[1], u).href);
    } catch { /* offline: the reload will show the error */ }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withFetch(), withInterceptors([authInterceptor, contentChangeInterceptor])),
    provideRouter(routes, withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }), withComponentInputBinding(),
      withNavigationErrorHandler(reloadOnStaleCode)),
    // render only after the saved language's texts are loaded (no Arabic flash for English visitors)
    provideAppInitializer(() => inject(I18n).ready),
  ]
};
