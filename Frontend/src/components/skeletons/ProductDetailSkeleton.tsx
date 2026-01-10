import { Skeleton } from "@/components/ui/skeleton";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ProductDetailSkeleton = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-24">
        {/* Breadcrumb Skeleton */}
        <div className="container mx-auto px-6 py-6">
          <Skeleton className="h-6 w-48" />
        </div>

        {/* Product Content Skeleton */}
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Image Gallery Skeleton */}
            <div className="space-y-4">
              <Skeleton className="w-full aspect-square rounded-lg" />
              <div className="flex gap-4 overflow-hidden">
                <Skeleton className="w-20 h-20 rounded-md shrink-0" />
                <Skeleton className="w-20 h-20 rounded-md shrink-0" />
                <Skeleton className="w-20 h-20 rounded-md shrink-0" />
                <Skeleton className="w-20 h-20 rounded-md shrink-0" />
              </div>
            </div>

            {/* Product Info Skeleton */}
            <div className="lg:py-8 space-y-8">
              {/* Category & New Badge */}
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>

              {/* Title */}
              <Skeleton className="h-12 w-3/4" />

              {/* Description */}
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>

              {/* Price */}
              <div className="flex items-end gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-4 w-8 mb-2" />
              </div>

              {/* Variants */}
              <div className="space-y-3">
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-3">
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                  <Skeleton className="h-10 w-24 rounded-md" />
                </div>
              </div>

              {/* Quantity & Add to Cart */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Skeleton className="h-12 w-32 rounded-lg" />
                <Skeleton className="h-12 flex-1 rounded-lg" />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pb-10 border-b border-border/30">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-24" />
              </div>

              {/* Features */}
              <div className="grid grid-cols-3 gap-6">
                <div className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <div className="flex flex-col items-center">
                  <Skeleton className="w-12 h-12 rounded-full mb-3" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProductDetailSkeleton;
