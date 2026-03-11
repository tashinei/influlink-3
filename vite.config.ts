import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import sitemap from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 5173,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      'anitra-nonenigmatic-areally.ngrok-free.dev'
    ]
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    sitemap({
      hostname: 'https://mvp.influ-link.com',
      dynamicRoutes: [                 // HomeMVP
        '/creator/about',        // Matched to App.tsx CreatorAbout
        '/brand/about',          // Matched to App.tsx BrandAbout
        '/contact',              // Contact
        '/profile/me',           // Profile
        '/register/brand',       // RegisterBrand
        '/register/creator',     // RegisterCreator
        '/creators/search',      // Matched to App.tsx (Fixed plural 's')
        '/campaigns/search',     // SearchCampaigns
        '/privacy',              // PrivacyPolicy
        '/terms',                // TermsConditions
        '/data-deletion',        // DataDeletion
        '/cookies'               // Cookies
      ],
      robots: [{
        userAgent: '*',
        allow: '/',
      }],
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));