import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // Force Vite to pre-bundle these CJS packages as proper ESM.
  // Without this, packages like `recharts`, `react-simple-code-editor`,
  // and `socket.io-client` can trigger the
  // "require_isUnsafeProperty is not a function" crash at runtime.
  optimizeDeps: {
    include: [
      // Code editor (interview room)
      'react-simple-code-editor',
      // Prism syntax highlighting
      'prismjs',
      'prismjs/components/prism-clike',
      'prismjs/components/prism-javascript',
      'prismjs/components/prism-python',
      'prismjs/components/prism-java',
      'prismjs/components/prism-c',
      'prismjs/components/prism-cpp',
      'prismjs/components/prism-go',
      'prismjs/components/prism-sql',
      // Agora video SDK (used in LiveInterviewRoom)
      'agora-rtc-react',
      // Recharts + its d3 sub-packages (used in SkillRadarWidget / RecruiterAnalytics)
      'recharts',
      'd3-scale',
      'd3-shape',
      'd3-array',
      'd3-color',
      'd3-format',
      'd3-interpolate',
      'd3-time',
      'd3-time-format',
      // Real-time socket (used directly in App.jsx and Home)
      'socket.io-client',
    ],
  },

  server: {
    proxy: {
      // Proxy all /api requests to the backend so no CORS issues in dev
      '/api': {
        target: 'http://localhost:5050',
        changeOrigin: true,
      },
    },
  },
})

