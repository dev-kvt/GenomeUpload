import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Show, RedirectToSignUp } from '@clerk/react';
import Landing from './components/Landing.jsx';
import GenomeUpload from './components/GenomeUpload.jsx';
import Navbar from './components/Navbar.jsx';

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
              <Navbar />
              <div className="med-grid min-h-screen">
                <div className="mx-auto flex max-w-5xl flex-col px-6 py-12">
                  <Show when="signed-in">
                    <GenomeUpload />
                  </Show>
                  <Show when="signed-out">
                    <RedirectToSignUp />
                  </Show>
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
