import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
    errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null
        };
    }

    static getDerivedStateFromError(error: Error): State {
        return {
            hasError: true,
            error,
            errorInfo: null
        };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('=== ERROR BOUNDARY CAUGHT ERROR ===');
        console.error('Error:', error);
        console.error('Error Info:', errorInfo);
        console.error('Component Stack:', errorInfo.componentStack);
        
        this.setState({
            error,
            errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                    <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
                                <AlertTriangle className="w-10 h-10 text-red-600" />
                            </div>
                            <h1 className="text-3xl font-bold text-red-600 mb-2">
                                Oops! Something went wrong
                            </h1>
                            <p className="text-gray-600">
                                Aplikasi mengalami error. Silakan refresh halaman atau hubungi administrator.
                            </p>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <h2 className="font-bold text-red-800 mb-2">Error Details:</h2>
                            <pre className="text-sm text-red-700 overflow-auto">
                                {this.state.error?.toString()}
                            </pre>
                        </div>

                        {this.state.errorInfo && (
                            <details className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                                <summary className="font-bold text-gray-800 cursor-pointer">
                                    Component Stack (Click to expand)
                                </summary>
                                <pre className="text-xs text-gray-600 mt-2 overflow-auto">
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}

                        <div className="flex gap-4 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Refresh Halaman
                            </button>
                            <button
                                onClick={() => window.location.href = '/login'}
                                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                            >
                                Kembali ke Login
                            </button>
                        </div>

                        <div className="mt-6 text-center text-sm text-gray-500">
                            <p>Jika masalah terus berlanjut, silakan:</p>
                            <ul className="list-disc list-inside mt-2">
                                <li>Clear browser cache (Ctrl + Shift + R)</li>
                                <li>Logout dan login kembali</li>
                                <li>Gunakan Incognito/Private window</li>
                                <li>Screenshot error ini dan kirim ke developer</li>
                            </ul>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
