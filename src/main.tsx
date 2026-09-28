import React from 'react';
import ReactDOM from 'react-dom/client';
<<<<<<< HEAD
import App from './App';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
=======
import { App } from './App';
import './styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root not found in index.html');
}

ReactDOM.createRoot(rootElement).render(
>>>>>>> d2f841410afb71effb9703b50bd6f7d70a67fe62
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
