import { Component } from 'react';
import type { ReactNode } from 'react';

/**
 * State interface for ErrorBoundary
 * hasError → tracks whether any child component has thrown an error
 */
interface State {
  hasError: boolean;
}

/**
 * ErrorBoundary Component
 * Catches JavaScript errors anywhere in its child component tree,
 * logs them, and displays a fallback UI instead of crashing the app.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {

  // Initial state
  state: State = { hasError: false };

  /**
   * Lifecycle method triggered when an error occurs
   * Updates state to show fallback UI
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  
  /**
   * Lifecycle method to log error details
   * Useful for debugging or sending logs to monitoring services
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("❌ ErrorBoundary caught an error:", error);
    console.error("📌 Error Info:", errorInfo);
  }
  
  /**
   * Render method
   * Shows fallback UI if error occurs, otherwise renders children
   */
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
          <h1>Something went wrong</h1>
          <p>Please refresh the page or try again later.</p>

          {/* Reload button for better UX */}
          <button onClick={() => window.location.reload()}>
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}