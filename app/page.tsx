import { DiagnosticForm } from "@/components/DiagnosticForm";

export default function Home() {
  return (
    <main className="relative">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
      </div>
      
      <DiagnosticForm />
    </main>
  );
}
