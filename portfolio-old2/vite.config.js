import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
    plugins: [react()],
    root: 'scripts', // Set Vite to use the scripts directory as the root
    build: {
        outDir: '../wwwroot/js', // Output directory for bundled files
        emptyOutDir: true,
        rollupOptions: {
            input: path.resolve(__dirname, 'scripts/app.tsx'), // Entry file
        },
    },
});
