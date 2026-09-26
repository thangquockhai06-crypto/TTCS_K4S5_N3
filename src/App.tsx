import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CRMDataProvider } from './context/CRMDataContext';
import { AppRoutes } from './routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CRMDataProvider>
          <AppRoutes />
        </CRMDataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
