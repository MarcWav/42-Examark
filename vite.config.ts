import {defineConfig} from 'vite';
export default defineConfig({build:{rollupOptions:{output:{manualChunks:{editor:['codemirror','@codemirror/lang-python','@codemirror/theme-one-dark']}}}},server:{host:'127.0.0.1',port:5173,strictPort:true}});
