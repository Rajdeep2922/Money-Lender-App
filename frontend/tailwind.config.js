/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'selector',
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#eef0fd',
                    100: '#dcdefb',
                    200: '#bcbef7',
                    300: '#9498f2',
                    400: '#6f74ec',
                    500: '#4f55f1',
                    600: '#494fdf',
                    700: '#3a40c4',
                    800: '#2f349f',
                    900: '#272b7f',
                    DEFAULT: '#494fdf',
                },
                brand: {
                    cobalt: '#494fdf',
                    bright: '#4f55f1',
                    deep: '#3a40c4',
                },
                /* Pure pitch-neutral scales: Eliminates blueish slate/cool-gray undertones in dark mode */
                gray: {
                    50: '#f9f9fb',
                    100: '#f2f2f5',
                    200: '#e4e4e9',
                    300: '#d1d1d8',
                    400: '#9e9ea7',
                    500: '#6c6c75',
                    600: '#4e4e56',
                    700: '#26262a',
                    750: '#1f1f23',
                    800: '#16181a', /* Authentic Revolut elevated surface - zero blue */
                    850: '#101012',
                    900: '#000000', /* True pure pitch black canvas */
                    950: '#000000',
                },
                slate: {
                    50: '#f9f9fb',
                    100: '#f2f2f5',
                    200: '#e4e4e9',
                    300: '#d1d1d8',
                    400: '#9e9ea7',
                    500: '#6c6c75',
                    600: '#4e4e56',
                    700: '#26262a',
                    800: '#16181a', /* Pure neutral dark surface */
                    900: '#000000', /* Pure black */
                    950: '#000000',
                },
                canvas: {
                    light: '#ffffff',
                    dark: '#000000',
                },
                surface: {
                    soft: '#f4f4f4',
                    card: '#ffffff',
                    deep: '#0a0a0a',
                    elevated: '#16181a',
                    light: '#ffffff',
                    dark: '#16181a',
                },
                hairline: {
                    light: '#e2e2e7',
                    dark: 'rgba(255,255,255,0.12)',
                    strong: '#191c1f',
                },
                ink: '#191c1f',
                body: '#1f2226',
                charcoal: '#3a3d40',
                mute: '#505a63',
                accent: {
                    teal: '#00a87e',
                    blue: '#376cd5',
                    lightBlue: '#007bc2',
                    green: '#428619',
                    yellow: '#b09000',
                    warning: '#ec7e00',
                    pink: '#e61e49',
                    danger: '#e23b4a',
                    red: '#8b0000',
                    brown: '#936d62',
                },
            },
            borderRadius: {
                none: '0px',
                sm: '8px',
                md: '12px',
                lg: '20px',
                xl: '28px',
                full: '9999px',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                display: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'pulse-glow': 'pulseGlow 2s infinite',
                'shimmer': 'shimmer 1.5s infinite',
                'scale-in': 'scaleIn 0.2s ease-out',
                'bounce-subtle': 'bounceSubtle 0.5s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 8px rgba(73, 79, 223, 0.4)' },
                    '50%': { boxShadow: '0 0 20px rgba(73, 79, 223, 0.6)' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-200% 0' },
                    '100%': { backgroundPosition: '200% 0' },
                },
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                bounceSubtle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-4px)' },
                },
            },
            boxShadow: {
                'glow-primary': '0 0 20px rgba(73, 79, 223, 0.3)',
                'glow-success': '0 0 20px rgba(0, 168, 126, 0.3)',
                'glow-warning': '0 0 20px rgba(236, 126, 0, 0.3)',
                'glow-error': '0 0 20px rgba(226, 59, 74, 0.3)',
                'elevated': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
            },
        },
    },
    plugins: [],
};
