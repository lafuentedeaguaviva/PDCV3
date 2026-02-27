import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-display text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 start-0 border-b border-white/20 bg-white/70 backdrop-blur-lg">
        <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
          <Link href="/" className="flex items-center space-x-3 rtl:space-x-reverse">
            <div className="size-10 bento-gradient-1 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-900/30">
              <span className="material-symbols-rounded text-2xl">lightbulb</span>
            </div>
            <span className="self-center text-2xl font-black whitespace-nowrap bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">EduPlan Pro</span>
          </Link>
          <div className="flex md:order-2 space-x-3 md:space-x-0 rtl:space-x-reverse gap-4">
            <Link href="/login">
              <Button variant="ghost" className="hidden md:flex">Iniciar Sesión</Button>
            </Link>
            <Link href="/register">
              <Button className="px-6">Empezar Gratis</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none">
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] rounded-full bg-blue-400/20 blur-[120px]" />
          <div className="absolute top-[30%] right-[10%] w-[400px] h-[400px] rounded-full bg-indigo-500/20 blur-[100px]" />
        </div>

        <div className="max-w-screen-xl mx-auto px-4 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold mb-8 border border-white/40 shadow-sm text-blue-700">
            <span className="animate-pulse">✨</span> Nuevo Sistema para la Gestión 2026
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 leading-tight text-slate-900">
            Planifica tus clases <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
              con Inteligencia.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
            La plataforma definitiva para docentes bolivianos. Crea PDCs alineados a la normativa, gestiona tus aulas y ahorra horas de trabajo administrativo.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register" className="w-full sm:w-auto">
              <Button className="px-8 py-4 text-lg h-auto shadow-blue-500/30 shadow-xl hover:shadow-2xl hover:scale-105">
                Crear mi primer PDC
              </Button>
            </Link>
            <Link href="#features" className="w-full sm:w-auto">
              <Button variant="secondary" className="px-8 py-4 text-lg h-auto bg-white hover:bg-slate-50">
                Ver demostración
              </Button>
            </Link>
          </div>

          {/* Dashboard Preview - Floating Glass Card */}
          <div className="mt-20 relative mx-auto max-w-5xl">
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl shadow-indigo-500/20 border border-slate-200/60 bg-white/50 backdrop-blur-xl p-2">
              <img
                src="/dashboard-preview.png"
                alt="Dashboard Preview"
                className="rounded-[1.5rem] w-full h-auto object-cover"
              />
              {/* Decorative Elements */}
              <div className="absolute -right-12 top-20 glass-card p-4 rounded-2xl animate-bounce duration-[3000ms] hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <span className="material-symbols-rounded">check_circle</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400">Estado</p>
                    <p className="text-sm font-black text-slate-800">PDC Aprobado</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Todo lo que necesitas para enseñar mejor</h2>
            <p className="text-slate-500 font-medium text-lg">Herramientas diseñadas específicamente para el modelo educativo boliviano.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: 'edit_document', title: 'Editor de PDCs', desc: 'Interfaz intuitiva para crear planes de desarrollo curricular paso a paso.' },
              { icon: 'library_books', title: 'Banco de Contenidos', desc: 'Accede a miles de contenidos base y recursos compartidos por la comunidad.' },
              { icon: 'assignment_turned_in', title: 'Evaluación Continua', desc: 'Gestiona criterios, dimensiones (Ser, Saber, Hacer, Decidir) y notas.' }
            ].map((feature, i) => (
              <div key={i} className="group p-8 rounded-[2rem] bg-slate-50 hover:bg-white border border-slate-100 hover:border-blue-100 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300">
                <div className="size-14 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-rounded text-3xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full z-0 bg-slate-50/50">
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>
        <div className="max-w-screen-xl mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Planes flexibles para cada necesidad</h2>
            <p className="text-slate-500 font-medium text-lg">Elige el paquete de créditos que mejor se adapte a tu ritmo de trabajo.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Basic Plan */}
            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow relative">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Básico</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">Bs. 50</span>
                <span className="text-slate-500 font-medium">/ mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>100 Créditos mensuales</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>Acceso a Contenidos Base</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>Exportación PDF básica</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Comenzar</Button>
            </div>

            {/* Pro Plan */}
            <div className="p-8 rounded-[2.5rem] bento-gradient-1 text-white shadow-xl shadow-blue-900/20 transform md:-translate-y-4 relative">
              <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-black px-3 py-1 rounded-bl-xl rounded-tr-[2.5rem]">MEJOR VALOR</div>
              <h3 className="text-xl font-bold mb-2">Profesional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black">Bs. 100</span>
                <span className="text-blue-100 font-medium">/ mes</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium text-white">
                  <span className="text-white material-symbols-rounded">check</span>
                  <span>250 Créditos mensuales</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-white">
                  <span className="text-white material-symbols-rounded">check</span>
                  <span>Contenidos Premium</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-white">
                  <span className="text-white material-symbols-rounded">check</span>
                  <span>Exportación Word Editable</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-white">
                  <span className="text-white material-symbols-rounded">check</span>
                  <span>Soporte Prioritario</span>
                </li>
              </ul>
              <Button className="w-full bg-white text-blue-900 hover:bg-blue-50">Obtener Pro</Button>
            </div>

            {/* Institutional Plan */}
            <div className="p-8 rounded-[2.5rem] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-shadow">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Institucional</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-black text-slate-900">Personalizado</span>
              </div>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>Créditos ilimitados</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>Panel de Director</span>
                </li>
                <li className="flex items-center gap-3 text-sm font-medium text-slate-600">
                  <span className="text-green-500 material-symbols-rounded">check</span>
                  <span>Gestión de Docentes</span>
                </li>
              </ul>
              <Button variant="outline" className="w-full">Contactar Ventas</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
        <div className="max-w-screen-xl mx-auto px-4 text-center">
          <p className="text-slate-400 font-medium">&copy; 2026 EduPlan Pro. Hecho con ❤️ para la educación.</p>
        </div>
      </footer>
    </div>
  );
}
