import React from "react";
import FalconLogo from "@/components/FalconLogo";
import { Button } from "@/components/ui/button";

interface State { hasError: boolean; }

export default class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, info: unknown) {
    // eslint-disable-next-line no-console
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-sm w-full text-center space-y-5">
          <div className="flex justify-center">
            <FalconLogo showWordmark size={120} />
          </div>
          <h1 className="font-display text-2xl font-bold">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            Sorry about that — an unexpected error stopped this page from loading. Please try again.
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="rounded-xl gradient-primary text-primary-foreground border-0 h-11 px-6"
          >
            Reload
          </Button>
        </div>
      </div>
    );
  }
}
