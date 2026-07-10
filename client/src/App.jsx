import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import GenomeUpload from './components/GenomeUpload.jsx';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Landing />}
        />
        <Route
          path="/analyze"
          element={
            <div className="min-h-screen bg-gradient-to-br from-mist-50 via-white to-mist-100 text-ink-700">
              <div className="med-grid min-h-screen">
                <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-6 py-12">
                  <GenomeUpload />
                </div>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
