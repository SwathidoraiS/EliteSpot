import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app/App'; // or './App' depending on your structure
import { ParkingProvider } from './features/parking/context/ParkingContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { registerSW } from "virtual:pwa-register";
import './index.css';
import "./i18n";

registerSW({ immediate: true });
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <ParkingProvider>
        <App />
      </ParkingProvider>
    </ErrorBoundary>
  </React.StrictMode>
);