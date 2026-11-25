import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sooner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CartProvider } from "./context/CartContext";
import { CartDrawer } from "./components/cart/CartDrawer";
import { Routes, Route } from "react-router-dom";
import { Seo } from './components/Seo';
import Index from "./pages/Index";
import ProductDetail from "./pages/ProductDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Collection from "./pages/Collection";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import NotFound from "./pages/NotFound";
import ScrollToTop from "./components/ScrollToTop";
import Editorial from './pages/Editorial';
import { editorialPages } from './lib/editorial';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sooner />
      <CartProvider>
        <>
          <Seo />
          <ScrollToTop />
          <CartDrawer />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/coleccion" element={<Collection />} />
            <Route path="/producto/:slug" element={<ProductDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/pedido-exitoso" element={<OrderSuccess />} />
            {Object.keys(editorialPages).map(path => <Route key={path} path={path} element={<Editorial />} />)}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
