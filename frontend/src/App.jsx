import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/auth/login/Login.jsx';
import AdminDashboard from './pages/admin/dashboard/AdminDashboard';
import UserDashboard from './pages/user/dashboard/UserDashboard';
import Home from './pages/home/Home';
import PrivateRoute from './auth/PrivateRoute';
import AllGames from './pages/games/allGames/AllGames';
import GameDetail from './pages/games/gameDetails/GameDetail';
import PurchaseHistory from './pages/user/history/PaymentHistory';

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/AllGame" element={<AllGames />} />
        <Route path="/game/:id" element={<GameDetail />} />

        {/* RUTAS PROTEGIDAS */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/user"
          element={
            <PrivateRoute role="cliente">
              <UserDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/user/history"
          element={
            <PrivateRoute role="cliente">
              <PurchaseHistory />
            </PrivateRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;