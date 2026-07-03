import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  erro: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { erro: false };

  static getDerivedStateFromError(): State {
    return { erro: true };
  }

  componentDidCatch(erro: Error, info: ErrorInfo): void {
    console.error('Erro não tratado na interface:', erro, info);
  }

  render(): ReactNode {
    if (this.state.erro) {
      return (
        <div className="mx-auto max-w-md p-6 text-center">
          <h1 className="text-xl font-bold text-neutral-800">Algo deu errado</h1>
          <p className="mt-2 text-sm text-neutral-600">
            Ocorreu um erro inesperado. Recarregue a página para tentar de novo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-4 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Recarregar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
