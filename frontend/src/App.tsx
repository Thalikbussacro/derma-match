import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RedirectIfAuth } from './components/RedirectIfAuth';
import { RequireAuth } from './components/RequireAuth';
import { CadastroPage } from './pages/CadastroPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFound } from './pages/NotFound';
import { QuestionarioPage } from './pages/QuestionarioPage';
import { RecuperarSenhaPage } from './pages/RecuperarSenhaPage';
import { RedefinirSenhaPage } from './pages/RedefinirSenhaPage';
import { RotinaPage } from './pages/RotinaPage';
import { PremiumPage } from './pages/PremiumPage';
import { ContaPage } from './pages/ContaPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          {/* Públicas */}
          <Route
            path="/login"
            element={
              <RedirectIfAuth>
                <LoginPage />
              </RedirectIfAuth>
            }
          />
          <Route
            path="/cadastro"
            element={
              <RedirectIfAuth>
                <CadastroPage />
              </RedirectIfAuth>
            }
          />
          <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          {/* Privadas */}
          <Route
            path="/"
            element={
              <RequireAuth>
                <HomePage />
              </RequireAuth>
            }
          />
          <Route
            path="/questionario"
            element={
              <RequireAuth>
                <QuestionarioPage />
              </RequireAuth>
            }
          />
          <Route
            path="/rotina"
            element={
              <RequireAuth>
                <RotinaPage />
              </RequireAuth>
            }
          />
          <Route
            path="/premium"
            element={
              <RequireAuth>
                <PremiumPage />
              </RequireAuth>
            }
          />
          <Route
            path="/conta"
            element={
              <RequireAuth>
                <ContaPage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
