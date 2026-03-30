# EasyNVR_H5

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build

tar -a -c -f C:\document\sirpho\EasyNVR_H5\dist\dist.zip --exclude=dist.zip -C C:\document\sirpho\EasyNVR_H5\dist .

scp "C:\document\sirpho\EasyNVR_H5\dist\dist.zip" root@www.sirpho.top:/var/www/html/nvr

Remove-Item -Path "C:\document\sirpho\EasyNVR_H5\dist" -Recurse -Force

ssh root@www.sirpho.top

cd /var/www/html/nvr
rm -rf assets  favicon.ico  icon  index.html  logo.png  tailwind.css
unzip dist.zip
rm -rf dist.zip
exit

```
