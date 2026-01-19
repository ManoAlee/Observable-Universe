/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                orbitron: ['Orbitron', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                cyan: {
                    400: '#00f2ff',
                    500: '#00ccff',
                },
                amber: {
                    500: '#ffb000',
                }
            }
        },
    },
    plugins: [],
}
