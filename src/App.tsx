import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/step1" element={<ProtectedRoute><Step1 /></ProtectedRoute>} />
          <Route path="/step2-upload" element={<ProtectedRoute><Step2Upload /></ProtectedRoute>} />
          <Route path="/step2-linkedin" element={<ProtectedRoute><Step2LinkedIn /></ProtectedRoute>} />
          <Route path="/step2-scratch" element={<ProtectedRoute><Step2Scratch /></ProtectedRoute>} />
          <Route path="/step3" element={<ProtectedRoute><Step3 /></ProtectedRoute>} />
          <Route path="/step4" element={<ProtectedRoute><Step4 /></ProtectedRoute>} />
          <Route path="/step5" element={<ProtectedRoute><Step5 /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
