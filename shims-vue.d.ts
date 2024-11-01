// src/shims-vue.d.ts (ou à la racine du projet)
declare module '*.vue' {
  import { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
