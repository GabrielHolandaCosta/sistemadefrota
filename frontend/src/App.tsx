import { Navigate, Route, Routes } from "react-router-dom";
import { useAppSelector } from "./hooks";
import { LandingPage } from "./features/landing/LandingPage";
import { LoginPage } from "./features/auth/LoginPage";
import { RegisterPage } from "./features/auth/RegisterPage";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { VehiclesPage } from "./features/vehicles/VehiclesPage";
import { MotoristasPage } from "./features/motoristas/MotoristasPage";
import { ManutencoesPage } from "./features/manutencoes/ManutencoesPage";
import { AbastecimentosPage } from "./features/abastecimentos/AbastecimentosPage";
import { ViagensPage } from "./features/viagens/ViagensPage";
import { AppLayout } from "./layouts/AppLayout";

function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAppSelector((s) => s.auth.accessToken);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <AppLayout>
              <DashboardPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/veiculos"
        element={
          <PrivateRoute>
            <AppLayout>
              <VehiclesPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/motoristas"
        element={
          <PrivateRoute>
            <AppLayout>
              <MotoristasPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/manutencoes"
        element={
          <PrivateRoute>
            <AppLayout>
              <ManutencoesPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/abastecimentos"
        element={
          <PrivateRoute>
            <AppLayout>
              <AbastecimentosPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/viagens"
        element={
          <PrivateRoute>
            <AppLayout>
              <ViagensPage />
            </AppLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}


