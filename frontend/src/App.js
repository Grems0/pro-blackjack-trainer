import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameProvider } from "./contexts/GameContext";
import HomePage from "./pages/HomePage";
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

function App() {
  return (
    <GameProvider>
      <div className="App">
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/charts" element={<ChartsPage />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/training/running-count" element={<RunningCountTraining />} />
            <Route path="/training/true-count" element={<TrueCountTraining />} />
            <Route path="/training/basic-strategy" element={<BasicStrategyTraining />} />
            <Route path="/training/deviations" element={<DeviationsTraining />} />
            <Route path="/training/in-casino" element={<CasinoSimulation />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/cancel" element={<PaymentCancelPage />} />
          </Routes>
        </BrowserRouter>
      </div>
    </GameProvider>
  );
}

export default App;
