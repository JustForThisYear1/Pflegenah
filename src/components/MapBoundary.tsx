import { Component, type ReactNode } from "react";

type Props = { children: ReactNode };
type State = { hasError: boolean; key: number };

export class MapBoundary extends Component<Props, State> {
  state: State = { hasError: false, key: 0 };

  static getDerivedStateFromError(): Partial<State> {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.warn("[MapBoundary] map failed to render:", error);
  }

  retry = () => {
    this.setState((s) => ({ hasError: false, key: s.key + 1 }));
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-[420px] flex-col items-center justify-center gap-3 rounded-3xl border border-border bg-muted p-6 text-center text-sm text-muted-foreground shadow-card">
          <p>Die Karte konnte nicht geladen werden.</p>
          <button
            onClick={this.retry}
            className="rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground"
          >
            Erneut versuchen
          </button>
        </div>
      );
    }
    return <div key={this.state.key}>{this.props.children}</div>;
  }
}

export default MapBoundary;
