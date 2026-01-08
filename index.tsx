import React, { Component, ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Defined explicit Props and State interfaces to fix TypeScript errors
interface ErrorBoundaryProps {
  children?: ReactNode; // Optional to satisfy strict type checking on usage
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
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
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-8 text-center z-[10000] relative">
            <div className="max-w-lg bg-slate-900 border border-red-500/30 p-8 rounded-3xl shadow-2xl">
                <h1 className="text-3xl font-black text-red-500 mb-4 uppercase tracking-tighter">Error Crítico</h1>
                <p className="text-slate-400 mb-6 font-medium">La aplicación ha encontrado un problema inesperado.</p>
                <div className="bg-slate-950 p-4 rounded-xl text-left mb-6 overflow-auto max-h-40 border border-slate-800">
                    <code className="text-xs text-red-400 font-mono">{this.state.error?.message || 'Error desconocido'}</code>
                </div>
                <button onClick={() => {
                    localStorage.clear();
                    window.location.reload();
                }} className="w-full px-6 py-4 bg-blue-600 rounded-xl font-black uppercase text-xs tracking-widest hover:bg-blue-500 shadow-lg shadow-blue-900/20 transition-all">
                    Reiniciar Aplicación (Limpiar Caché)
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

// Señal de que React se ha montado correctamente
// Esto asegura que el loader se quite justo cuando React arranca, no antes ni después.
setTimeout(() => {
    document.body.classList.add('ready');
}, 500);