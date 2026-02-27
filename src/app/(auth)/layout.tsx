export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-50">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/20 blur-[100px]" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <div className="flex items-center gap-3">
                        <div className="size-12 bento-gradient-1 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
                            <span className="material-symbols-rounded text-3xl">lightbulb</span>
                        </div>
                        <span className="font-black text-2xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                            EduPlan Pro
                        </span>
                    </div>
                </div>

                {children}

                <div className="mt-8 text-center text-xs text-slate-400 font-medium">
                    &copy; {new Date().getFullYear()} EduPlan Pro. Todos los derechos reservados.
                </div>
            </div>
        </div>
    );
}
