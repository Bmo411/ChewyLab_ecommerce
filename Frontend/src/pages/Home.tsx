import { ArrowRight, Flame, Leaf, Zap } from "lucide-react";
import HeroSection from "../components/HeroSection";

export default function Home() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <HeroSection />

      {/* Collections Preview */}
      <section className="max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          Nuestras Fórmulas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Spicy */}
          <div className="group relative bg-lab-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300 border border-lab-gold/20 shadow-lg hover:shadow-xl hover:border-lab-pink/50">
            <div className="h-64 bg-lab-pink/10 flex items-center justify-center">
              <Flame className="w-24 h-24 text-lab-pink opacity-80" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-lab-white mb-2">
                Spicy Lab
              </h3>
              <p className="text-gray-300">
                Mezclas explosivas con chilito y especias selectas.
              </p>
            </div>
          </div>

          {/* Sour */}
          <div className="group relative bg-lab-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300 border border-lab-gold/20 shadow-lg hover:shadow-xl hover:border-lab-yellow/50">
            <div className="h-64 bg-lab-yellow/10 flex items-center justify-center">
              <Zap className="w-24 h-24 text-lab-yellow opacity-80" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-lab-white mb-2">
                Sour Lab
              </h3>
              <p className="text-gray-300">
                Acidez extrema que despierta tus sentidos.
              </p>
            </div>
          </div>

          {/* Botanical */}
          <div className="group relative bg-lab-dark/50 backdrop-blur-sm rounded-2xl overflow-hidden cursor-pointer hover:-translate-y-2 transition-transform duration-300 border border-lab-gold/20 shadow-lg hover:shadow-xl hover:border-lab-green/50">
            <div className="h-64 bg-lab-green/10 flex items-center justify-center">
              <Leaf className="w-24 h-24 text-lab-green opacity-80" />
            </div>
            <div className="p-6">
              <h3 className="text-2xl font-bold text-lab-white mb-2">
                Botanical Mix
              </h3>
              <p className="text-gray-300">
                Infusiones herbales y frutales sofisticadas.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
