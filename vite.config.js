import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import react from '@vitejs/plugin-react'; // Atau vue mengikut projek anda

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.jsx'],
            refresh: true,
        }),
        react(),
    ],
    server: {
        host: '127.0.0.1', // Paksa Vite guna IPv4 bukannya IPv6 [::1]
        cors: true,       // Benarkan semua CORS origin semasa proses pembangunan
    },
});
