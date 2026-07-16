import { useNavigate, useLocation } from 'react-router-dom';
import { Show, SignInButton, SignUpButton, UserButton } from '@clerk/react';
import { Dna } from 'lucide-react';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isAnalyzePage = location.pathname === '/analyze';

  return (
    <nav className="sticky top-0 z-50 border-b border-mist-200 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div 
          onClick={() => navigate('/')} 
          className="flex items-center gap-2 text-ink-700 cursor-pointer hover:opacity-85 transition"
        >
          <Dna className="h-6 w-6 text-tealish-500" />
          <span className="text-lg font-bold tracking-tight">GenomeScan</span>
        </div>
        
        <div className="flex items-center gap-4">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button className="text-sm font-semibold text-ink-600 hover:text-tealish-500 transition px-3 py-2">
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-full bg-tealish-500 px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-tealish-600 transition active:scale-95">
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            {!isAnalyzePage ? (
              <button
                onClick={() => navigate('/analyze')}
                className="rounded-full bg-tealish-500 px-5 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-tealish-600 hover:shadow-lg active:scale-95"
              >
                Launch Scanner
              </button>
            ) : (
              <button
                onClick={() => navigate('/')}
                className="text-sm font-semibold text-ink-600 hover:text-tealish-500 transition px-3 py-2"
              >
                Home
              </button>
            )}
            <div className="flex items-center justify-center">
              <UserButton afterSignOutUrl="/" />
            </div>
          </Show>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
