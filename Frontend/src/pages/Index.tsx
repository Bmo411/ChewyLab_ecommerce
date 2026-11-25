import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoriesSection from "@/components/CategoriesSection";
import ProductsSection from "@/components/ProductsSection";
import StorySection from "@/components/StorySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main id="contenido">
        <HeroSection />
        <CategoriesSection />
        <ProductsSection />
        <StorySection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
