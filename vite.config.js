import * as fs from "node:fs";
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path';
import replace from "@rollup/plugin-replace";

const manifest = JSON.parse(fs.readFileSync("manifest.json"));

const isProduction = process.env.NODE_ENV === 'production';
const rootDir = resolve(__dirname);
const srcDir = resolve(rootDir, 'src');

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  publicDir: resolve(rootDir, 'public'),
  outDir: resolve(rootDir, 'dist'),
  build:
    {
      minify: isProduction, // is false in dev mode
      rollupOptions:
        {
          input: {
            SidePanel: resolve(srcDir, 'SidePanel', 'index.html'),
            ServiceWorker: resolve(srcDir, 'ServiceWorker', 'main.ts')
          },
          output: {
            entryFileNames: 'src/[name]/index.js',
            chunkFileNames: '[name]/index.js',
            assetFileNames: 'assets/[name].[ext]',
            format: 'es'
          },
          plugins: [
            replace({
              'process.env.NODE_ENV': () => isProduction ? JSON.stringify('production') : JSON.stringify('development'),
              __dirname: (id) => isProduction ? `''` : `'${id}'`,
              __app_version: () => `'${manifest.version}'`,
              __app_description: () => `'${manifest.description}'`,
              preventAssignment: true,
            }),
          ]
        }
    }
})
