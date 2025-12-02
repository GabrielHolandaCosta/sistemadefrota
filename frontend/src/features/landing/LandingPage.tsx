import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

export function LandingPage() {
  const [truckPosition, setTruckPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTruckPosition((prev) => (prev >= 100 ? 0 : prev + 0.5));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.1),transparent)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/20 border border-primary-500/30 text-primary-300 text-sm font-medium mb-4">
              <span className="h-2 w-2 rounded-full bg-primary-400 animate-pulse" />
              Sistema de Gestão de Frotas em Tempo Real
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-primary-400 to-cyan-400 bg-clip-text text-transparent">
                Gerencie sua frota
              </span>
              <br />
              com inteligência e eficiência
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Plataforma completa para gestão de veículos, motoristas, manutenções,
              abastecimentos e viagens. Tudo em um só lugar, com relatórios em tempo
              real e controle total da sua operação.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <Link
                to="/register"
                className="group relative px-8 py-4 bg-primary-500 hover:bg-primary-400 rounded-xl font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-primary-500/50"
              >
                <span className="relative z-10">Começar Agora</span>
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary-400 to-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-4 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 rounded-xl font-semibold text-slate-100 transition-all duration-300 hover:scale-105"
              >
                Fazer Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Tudo que você precisa para{" "}
            <span className="text-primary-400">gerenciar sua frota</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Funcionalidades poderosas projetadas para otimizar sua operação e
            reduzir custos.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon="🚗"
            title="Gestão de Veículos"
            description="Cadastre e gerencie toda sua frota. Controle documentação, status, manutenções e histórico completo de cada veículo."
          />
          <FeatureCard
            icon="👨‍✈️"
            title="Gestão de Motoristas"
            description="Cadastre motoristas, gerencie CNH, histórico de veículos designados e acompanhe o desempenho de cada condutor."
          />
          <FeatureCard
            icon="⚙️"
            title="Manutenções"
            description="Registre manutenções preventivas e corretivas. Receba alertas automáticos e mantenha sua frota sempre em dia."
          />
          <FeatureCard
            icon="⛽"
            title="Controle de Combustível"
            description="Registre abastecimentos, calcule consumo médio automaticamente e monitore gastos com combustível por veículo."
          />
          <FeatureCard
            icon="🗺️"
            title="Rastreamento de Viagens"
            description="Registre todas as viagens, rotas, distâncias percorridas e tenha relatórios detalhados de uso da frota."
          />
          <FeatureCard
            icon="📊"
            title="Dashboards e Relatórios"
            description="Visualize indicadores em tempo real, gráficos interativos e relatórios completos para tomada de decisão."
          />
        </div>
      </div>

      {/* Animated Map Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 md:p-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              Rastreamento em Tempo Real
            </h2>
            <p className="text-slate-400">
              Acompanhe seus veículos em movimento com nosso sistema de
              rastreamento fictício
            </p>
          </div>

          {/* Fictitious Map */}
          <div className="relative h-64 md:h-96 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border border-slate-700 overflow-hidden">
            {/* Road */}
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-slate-600 relative">
                <div
                  className="absolute h-1 bg-primary-400"
                  style={{ width: "100%" }}
                />
                {/* Road markings */}
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute h-1 w-8 bg-slate-500"
                    style={{
                      left: `${i * 10}%`,
                      animation: `slide ${2}s linear infinite`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Truck Icon */}
            <div
              className="absolute top-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
              style={{ left: `${truckPosition}%` }}
            >
              <div className="text-4xl md:text-6xl animate-bounce">
                🚛
              </div>
            </div>

            {/* Cities/Locations */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />
              <span className="text-xs text-slate-300 font-medium">São Paulo</span>
            </div>
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              <span className="text-xs text-slate-300 font-medium">Rio de Janeiro</span>
            </div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-amber-400 shadow-lg shadow-amber-400/50" />
              <span className="text-xs text-slate-300 font-medium">Belo Horizonte</span>
            </div>
          </div>
        </div>
      </div>

      {/* Role Selection */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Escolha seu perfil
          </h2>
          <p className="text-slate-400 text-lg">
            Cadastre-se como Gestor ou Motorista e comece a usar o sistema
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <RoleCard
            title="Gestor"
            description="Acesso completo ao sistema. Gerencie veículos, motoristas, manutenções, abastecimentos e visualize relatórios completos da frota."
            features={[
              "Dashboard completo com indicadores",
              "Gestão de veículos e motoristas",
              "Controle de manutenções e custos",
              "Relatórios e gráficos detalhados",
            ]}
            link="/register"
            linkText="Cadastrar como Gestor"
            color="primary"
          />
          <RoleCard
            title="Motorista"
            description="Registre suas viagens, abastecimentos e acompanhe seu histórico pessoal de rotas e desempenho."
            features={[
              "Registro de viagens",
              "Controle de abastecimentos",
              "Histórico pessoal",
              "Acompanhamento de desempenho",
            ]}
            link="/register"
            linkText="Cadastrar como Motorista"
            color="cyan"
          />
        </div>
      </div>

      {/* Footer CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-primary-500/20 to-cyan-500/20 border border-primary-500/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Junte-se a empresas que já otimizaram sua gestão de frotas com nosso
            sistema. Cadastre-se gratuitamente e comece hoje mesmo.
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-primary-500 hover:bg-primary-400 rounded-xl font-semibold text-white shadow-lg shadow-primary-500/30 transition-all duration-300 hover:scale-105"
          >
            Criar Conta Gratuita
          </Link>
        </div>
      </div>

      <style>{`
        @keyframes slide {
          from { transform: translateX(0); }
          to { transform: translateX(100%); }
        }
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

type FeatureCardProps = {
  icon: string;
  title: string;
  description: string;
};

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="group relative bg-slate-900/80 border border-slate-800 rounded-xl p-6 hover:border-primary-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary-500/20">
      <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-slate-100">{title}</h3>
      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
    </div>
  );
}

type RoleCardProps = {
  title: string;
  description: string;
  features: string[];
  link: string;
  linkText: string;
  color: "primary" | "cyan";
};

function RoleCard({
  title,
  description,
  features,
  link,
  linkText,
  color,
}: RoleCardProps) {
  const colorClasses =
    color === "primary"
      ? "from-primary-500/20 to-primary-600/20 border-primary-500/30"
      : "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30";

  return (
    <div
      className={`bg-gradient-to-br ${colorClasses} border rounded-2xl p-8 hover:scale-105 transition-all duration-300`}
    >
      <h3 className="text-2xl font-bold mb-3">{title}</h3>
      <p className="text-slate-300 mb-6">{description}</p>
      <ul className="space-y-2 mb-6">
        {features.map((feature, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-300">
            <span className="text-primary-400 mt-1">✓</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Link
        to={link}
        className={`block w-full text-center px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
          color === "primary"
            ? "bg-primary-500 hover:bg-primary-400 text-white"
            : "bg-cyan-500 hover:bg-cyan-400 text-white"
        }`}
      >
        {linkText}
      </Link>
    </div>
  );
}

