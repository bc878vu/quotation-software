import { Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CreateQuotation from './pages/CreateQuotation';

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />

        <Route
          path="/quotations/new"
          element={<CreateQuotation />}
        />

        <Route
          path="/quotations/edit/:id"
          element={<CreateQuotation />}
        />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
