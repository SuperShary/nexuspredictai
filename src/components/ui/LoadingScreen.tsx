export const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6">
        <div className="relative w-20 h-20 mx-auto">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20"></div>
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-accent animate-spin animate-reverse"></div>
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-heading text-foreground">Initializing AI System</h2>
          <p className="text-muted-foreground terminal-text">Connecting to neural networks...</p>
        </div>
        <div className="flex justify-center space-x-1">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-ai-success rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </div>
    </div>
  );
};