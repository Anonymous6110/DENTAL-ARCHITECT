import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import App from './App.tsx';
import './index.css';

const convexUrl = process.env.VITE_CONVEX_URL;
const isValidUrl = typeof convexUrl === 'string' && (convexUrl.startsWith('http://') || convexUrl.startsWith('https://'));

const convex = isValidUrl ? new ConvexReactClient(convexUrl) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {convex ? (
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    ) : (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Configuration Required</h1>
          <p className="text-zinc-400 mb-6">
            Please set the <code className="bg-white/10 px-2 py-1 rounded text-emerald-400">VITE_CONVEX_URL</code> 
            environment variable in the Settings menu to connect your database.
          </p>
          <div className="text-xs text-zinc-500">
            Once configured, the application will automatically connect to your Convex deployment.
          </div>
        </div>
      </div>
    )}
  </StrictMode>,
);
