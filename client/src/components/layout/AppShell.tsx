import { TopBar } from './TopBar';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[#0f0f0f] flex flex-col">
      <TopBar />
      <main className="flex-1 px-4 pb-safe">
        {children}
      </main>
    </div>
  );
}
