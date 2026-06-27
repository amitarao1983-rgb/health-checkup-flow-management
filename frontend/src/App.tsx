import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import RegistrationPage from './pages/RegistrationPage';
import ReceptionistPage from './pages/ReceptionistPage';
import PatientPortalPage from './pages/PatientPortalPage';
import CoordinatorPage from './pages/CoordinatorPage';
import DepartmentPage from './pages/DepartmentPage';
import DoctorSchedulePage from './pages/DoctorSchedulePage';
import MOISReportPage from './pages/MOISReportPage';
import CompletionPage from './pages/CompletionPage';
import AIQueuePage from './pages/AIQueuePage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/receptionist" element={<ReceptionistPage />} />
      <Route path="/patient" element={<PatientPortalPage />} />
      <Route path="/coordinator" element={<CoordinatorPage />} />
      <Route path="/department" element={<DepartmentPage />} />
      <Route path="/doctor-schedule" element={<DoctorSchedulePage />} />
      <Route path="/mois-report" element={<MOISReportPage />} />
      <Route path="/completion" element={<CompletionPage />} />
      <Route path="/ai-queue" element={<AIQueuePage />} />
    </Routes>
  );
}
