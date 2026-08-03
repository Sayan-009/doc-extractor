import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Toast from './components/ui/Toast';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Sessions from './pages/Sessions';
import SessionDetailPage from './pages/SessionDetailPage';
import FieldBuilderPage from './pages/FieldBuilderPage';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AuthCallback from './pages/AuthCallback';
import Templates from './pages/Templates';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected Routes inside AppLayout */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/sessions" element={<Sessions />} />
          <Route path="/sessions/:id" element={<SessionDetailPage />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/templates/new" element={<FieldBuilderPage />} />
          <Route path="/templates/:id" element={<FieldBuilderPage />} />
          <Route path="/settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </BrowserRouter>
  );
}

export default App;
