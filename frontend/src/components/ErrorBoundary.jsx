import { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error('Unhandled UI error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <AlertTriangle className="error-boundary__icon" size={48} />
          <h2>Something went wrong</h2>
          <p>An unexpected error occurred. Try reloading the page.</p>
          <button className="btn btn-primary" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
