import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Templates from './pages/Templates';
import Step1 from './pages/Step1';
import Step2Upload from './pages/Step2Upload';
import Step2LinkedIn from './pages/Step2LinkedIn';
import Step2Scratch from './pages/Step2Scratch';
import Step3 from './pages/Step3';
import Step4 from './pages/Step4';
import Step5 from './pages/Step5';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import { LEGACY_ROUTES, ROUTES } from './lib/routes';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path={ROUTES.home} element={<Home />} />
          <Route path={ROUTES.login} element={<Auth />} />
          <Route path={ROUTES.signUp} element={<Auth />} />
          <Route path={ROUTES.templates} element={<Templates />} />
          <Route path={ROUTES.contact} element={<Contact />} />
          <Route path={ROUTES.privacy} element={<Privacy />} />
          <Route path={ROUTES.dashboard} element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path={ROUTES.step1} element={<ProtectedRoute><Step1 /></ProtectedRoute>} />
          <Route path={ROUTES.step2Upload} element={<ProtectedRoute><Step2Upload /></ProtectedRoute>} />
          <Route path={ROUTES.step2LinkedIn} element={<ProtectedRoute><Step2LinkedIn /></ProtectedRoute>} />
          <Route path={ROUTES.step2Scratch} element={<ProtectedRoute><Step2Scratch /></ProtectedRoute>} />
          <Route path={ROUTES.step3} element={<ProtectedRoute><Step3 /></ProtectedRoute>} />
          <Route path={ROUTES.step4} element={<ProtectedRoute><Step4 /></ProtectedRoute>} />
          <Route path={ROUTES.step5} element={<ProtectedRoute><Step5 /></ProtectedRoute>} />
          <Route path={LEGACY_ROUTES.auth} element={<Navigate to={ROUTES.login} replace />} />
          <Route path={LEGACY_ROUTES.step1} element={<Navigate to={ROUTES.step1} replace />} />
          <Route path={LEGACY_ROUTES.step2Upload} element={<Navigate to={ROUTES.step2Upload} replace />} />
          <Route path={LEGACY_ROUTES.step2LinkedIn} element={<Navigate to={ROUTES.step2LinkedIn} replace />} />
          <Route path={LEGACY_ROUTES.step2Scratch} element={<Navigate to={ROUTES.step2Scratch} replace />} />
          <Route path={LEGACY_ROUTES.step3} element={<Navigate to={ROUTES.step3} replace />} />
          <Route path={LEGACY_ROUTES.step4} element={<Navigate to={ROUTES.step4} replace />} />
          <Route path={LEGACY_ROUTES.step5} element={<Navigate to={ROUTES.step5} replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
