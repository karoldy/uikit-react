import { sassPlugin } from 'esbuild-sass-plugin';
import { defineConfig } from 'tsup';

export default defineConfig({
  clean: true,
  target: 'es2022',
  esbuildPlugins: [sassPlugin()],
  format: ['esm', 'cjs'],
  entry: {
    index: 'src/index.ts',
    styles: 'src/styles/data-table.scss',
  },
  dts: {
    entry: {
      index: 'src/index.ts',
    },
  },
});
