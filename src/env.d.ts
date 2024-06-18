/* eslint-disable */

declare namespace NodeJS {
  interface ProcessEnv {
    API_URL: string;
    IDMED_PROV_SERVER: string;
    IDART_PROV_SERVER: string;
    NODE_ENV: string;
    VUE_ROUTER_MODE: 'hash' | 'history' | 'abstract' | undefined;
    VUE_ROUTER_BASE: string | undefined;
  }
}
