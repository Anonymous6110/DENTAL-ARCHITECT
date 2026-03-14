import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Intercept fetch calls to add the Authorization token
const originalFetch = window.fetch;
window.fetch = async (...args) => {
  let [resource, config] = args;
  
  // Get token from localStorage (we store the whole user object, so parse it)
  const storedUser = localStorage.getItem('user');
  let token = null;
  if (storedUser) {
    try {
      const user = JSON.parse(storedUser);
      token = user.token;
    } catch (e) {}
  }

  // Also check doctor_user if applicable
  if (!token) {
    const storedDoctor = localStorage.getItem('doctor_user');
    if (storedDoctor) {
      try {
        const doctor = JSON.parse(storedDoctor);
        token = doctor.token;
      } catch (e) {}
    }
  }

  if (token && typeof resource === 'string' && resource.startsWith('/api/')) {
    config = config || {};
    config.headers = {
      ...config.headers,
      'Authorization': `Bearer ${token}`
    };
    return originalFetch(resource, config);
  }
  
  return originalFetch(...args);
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
