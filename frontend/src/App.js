import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import { AuthProvider } from "./contexts/AuthContext";
import HomePage from "./pages/HomePage";
import CasinoLanding from "./pages/CasinoLanding";
import ChartsPage from "./pages/ChartsPage";
import RunningCountTraining from "./components/training/RunningCountTraining";
import TrueCountTraining from "./components/training/TrueCountTraining";
import BasicStrategyTraining from "./components/training/BasicStrategyTraining";
import DeviationsTraining from "./components/training/DeviationsTraining";
import CasinoSimulation from "./components/training/CasinoSimulation";
import Academy from "./components/pages/Academy";
import PricingPage from "./pages/PricingPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelPage from "./pages/PaymentCancelPage";
import LoginPage from "./pages/LoginPage";
import ProRoute from "./components/routing/ProRoute";

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <div className="App">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<CasinoLanding />} />
              <Route path="/training" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/payment/success" element={<PaymentSuccessPage />} />
              <Route path="/payment/cancel" element={<PaymentCancelPage />} />

              {/* Routes Pro — nécessitent un compte */}
              <Route path="/charts" element={<ProRoute><ChartsPage /></ProRoute>} />
              <Route path="/academy" element={<ProRoute><Academy /></ProRoute>} />
              <Route path="/training/true-count" element={<ProRoute><TrueCountTraining /></ProRoute>} />
              <Route path="/training/deviations" element={<ProRoute><DeviationsTraining /></ProRoute>} />
              <Route path="/training/in-casino" element={<ProRoute><CasinoSimulation /></ProRoute>} />

              {/* Routes gratuites */}
              <Route path="/training/running-count" element={<RunningCountTraining />} />
              <Route path="/training/basic-strategy" element={<BasicStrategyTraining />} />
            </Routes>
          </BrowserRouter>
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;
