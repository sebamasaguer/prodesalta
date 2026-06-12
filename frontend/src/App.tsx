import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AuthProvider } from "./context/AuthContext";
import { AppLayout } from "./layouts/AppLayout";

import { AdminFixturePage } from "./pages/AdminFixturePage";
import { AdminPage } from "./pages/AdminPage";
import { AdminScoringPage } from "./pages/AdminScoringPage";
import { AdminSponsorsPage } from "./pages/AdminSponsorsPage";
import { AdminTeamsPage } from "./pages/AdminTeamsPage";
import { AdminUsersPage } from "./pages/AdminUsersPage";
import { AdminTournamentsPage } from "./pages/AdminTournamentsPage";
import { CreateGroupPage } from "./pages/CreateGroupPage";
import { DashboardPage } from "./pages/DashboardPage";
import { GroupDetailPage } from "./pages/GroupDetailPage";
import { GroupsPage } from "./pages/GroupsPage";
import { JoinGroupPage } from "./pages/JoinGroupPage";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { MatchesPage } from "./pages/MatchesPage";
import { PredictionsPage } from "./pages/PredictionsPage";
import { RankingPage } from "./pages/RankingPage";
import { RegisterPage } from "./pages/RegisterPage";
import { StatsPage } from "./pages/StatsPage";
import { AdminFixtureImportPage } from "./pages/AdminFixtureImportPage";
import { ForgotPasswordPage } from "./pages/ForgotPasswordPage";
import { ProfilePage } from "./pages/ProfilePage";
import { ResetPasswordPage } from "./pages/ResetPasswordPage";
import { RulesPage } from "./pages/RulesPage";
import { TermsPage } from "./pages/TermsPage";
import { VerifyEmailPage } from "./pages/VerifyEmailPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/verificar-correo" element={<VerifyEmailPage />} />
          <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
          <Route path="/restablecer-contrasena" element={<ResetPasswordPage />} />
          <Route path="/terminos" element={<TermsPage />} />
          <Route path="/reglamento" element={<RulesPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/perfil" element={<ProfilePage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/grupos" element={<GroupsPage />} />
            <Route path="/grupos/nuevo" element={<CreateGroupPage />} />
            <Route path="/grupos/unirse" element={<JoinGroupPage />} />
            <Route path="/grupos/:groupId" element={<GroupDetailPage />} />
            <Route path="/partidos" element={<MatchesPage />} />
            <Route path="/predicciones" element={<PredictionsPage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/estadisticas" element={<StatsPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/torneos" element={<AdminTournamentsPage />} />
            <Route path="/admin/equipos" element={<AdminTeamsPage />} />
            <Route path="/admin/fixture" element={<AdminFixturePage />} />
            <Route path="/admin/importar-fixture" element={<AdminFixtureImportPage />} />
            <Route path="/admin/puntajes" element={<AdminScoringPage />} />
            <Route path="/admin/sponsors" element={<AdminSponsorsPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;