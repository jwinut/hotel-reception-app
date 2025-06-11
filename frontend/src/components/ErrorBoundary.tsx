import React, { Component, ErrorInfo, ReactNode } from 'react';
import './ErrorBoundary.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // In production, you would send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service (Sentry, LogRocket, etc.)
      console.error('Production error:', { error, errorInfo });
    }
  }

  handleReload = (): void => {
    // Reset error state and reload the component
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  handleGoHome = (): void => {
    window.location.href = '/';
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon" role="img" aria-label="Warning">⚠️</div>
            <h2>เกิดข้อผิดพลาดในระบบ</h2>
            <p>ขออภัยในความไม่สะดวก ระบบเกิดข้อผิดพลาดที่ไม่คาดคิด</p>
            
            <div className="error-actions">
              <button 
                className="error-button primary" 
                onClick={this.handleReload}
                type="button"
              >
                โหลดหน้าใหม่
              </button>
              <button 
                className="error-button secondary" 
                onClick={this.handleGoHome}
                type="button"
              >
                กลับหน้าหลัก
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="error-details">
                <summary>รายละเอียดข้อผิดพลาด (สำหรับนักพัฒนา)</summary>
                <pre className="error-stack">
                  {this.state.error && this.state.error.toString()}
                  <br />
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;