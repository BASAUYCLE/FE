/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Epilogue', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
            },
            colors: {
                primary: '#00ccad',
                'primary-hover': '#00b89a',
                'primary-light': '#E8F8F5',
                'accent-yellow': '#FAD02E',
                'background-light': '#f9fafa',
                'background-dark': '#1e2124',
            },
        },
    },
    plugins: [],
}
