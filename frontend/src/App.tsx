import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { RedirectIfAuth } from './components/RedirectIfAuth';
import { RequireAuth } from './components/RequireAuth';
import { CadastroPage } from './pages/CadastroPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFound } from './pages/NotFound';
import { PrivacidadePage } from './pages/PrivacidadePage';
import { QuestionarioPage } from './pages/QuestionarioPage';
import { RecuperarSenhaPage } from './pages/RecuperarSenhaPage';
import { RedefinirSenhaPage } from './pages/RedefinirSenhaPage';
import { RotinaPage } from './pages/RotinaPage';
import { PremiumPage } from './pages/PremiumPage';
import { ContaPage } from './pages/ContaPage';
import { ChatPage } from './pages/ChatPage';
import { BiomedicaLayout } from './components/biomedica/BiomedicaLayout';
import { RequireBiomedica } from './components/biomedica/RequireBiomedica';
import { BiomedicaAuthProvider } from './features/biomedica/BiomedicaAuthProvider';
import { BiomedicaAtendimentoPage } from './pages/biomedica/BiomedicaAtendimentoPage';
import { BiomedicaDashboardPage } from './pages/biomedica/BiomedicaDashboardPage';
import { BiomedicaLoginPage } from './pages/biomedica/BiomedicaLoginPage';
import { AdminLayout } from './components/admin/AdminLayout';
import { RequireAdmin } from './components/admin/RequireAdmin';
import { AdminAuthProvider } from './features/admin/AdminAuthProvider';
import { AdminBiomedicasPage } from './pages/admin/AdminBiomedicasPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminQuestionarioPage } from './pages/admin/AdminQuestionarioPage';
import { AdminTiposPelePage } from './pages/admin/AdminTiposPelePage';

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
          <Route path="/privacidade" element={<PrivacidadePage />} />

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
            path="/chat"
            element={
              <RequireAuth>
                <ChatPage />
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

        {/* Área da biomédica: layout e autenticação próprios (ADR-0012). */}
        <Route
          path="/biomedica"
          element={
            <BiomedicaAuthProvider>
              <BiomedicaLayout />
            </BiomedicaAuthProvider>
          }
        >
          <Route path="login" element={<BiomedicaLoginPage />} />
          <Route
            index
            element={
              <RequireBiomedica>
                <BiomedicaDashboardPage />
              </RequireBiomedica>
            }
          />
          <Route
            path="atendimento/:id"
            element={
              <RequireBiomedica>
                <BiomedicaAtendimentoPage />
              </RequireBiomedica>
            }
          />
        </Route>

        {/* Área do admin: layout e autenticação próprios (ADR-0016). */}
        <Route
          path="/admin"
          element={
            <AdminAuthProvider>
              <AdminLayout />
            </AdminAuthProvider>
          }
        >
          <Route path="login" element={<AdminLoginPage />} />
          <Route
            index
            element={
              <RequireAdmin>
                <AdminBiomedicasPage />
              </RequireAdmin>
            }
          />
          <Route
            path="questionario"
            element={
              <RequireAdmin>
                <AdminQuestionarioPage />
              </RequireAdmin>
            }
          />
          <Route
            path="tipos-pele"
            element={
              <RequireAdmin>
                <AdminTiposPelePage />
              </RequireAdmin>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
