import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Defined explicit Props and State interfaces to fix TypeScript errors
interface ErrorBoundaryProps {
  children?: ReactNode; // Optional to satisfy strict type checking on usage
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Defined state as a class property to fix 'Property state does not exist'
  public state: ErrorBoundaryState = { hasError: false };

  // Explicitly declare props to fix 'Property props does not exist' error
  public props: ErrorBoundaryProps;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.props = props;
  }

  static getDerivedStateFromError(error: any): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 text-center">
            <div>
                <h1 className="text-3xl font-black text-blue-500 mb-4">Algo salió mal</h1>
                <p className="text-slate-400">Por favor recarga la página o intenta más tarde.</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-6 py-3 bg-blue-600 rounded-xl font-bold uppercase text-xs tracking-widest hover:bg-blue-500">
                    Recargar
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
        <App />
    </ErrorBoundary>
  </React.StrictMode>
);