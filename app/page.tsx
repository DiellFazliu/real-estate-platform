import { HeroSection } from '@/components/prototype/HeroSection'
import { FeaturedProperties } from '@/components/prototype/FeaturedProperties'
import { RentProperties } from '@/components/prototype/RentProperties'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <HeroSection />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Featured Properties
          </h2>
          <FeaturedProperties />
        </div>
      </section>

      <section className="py-20 bg-[#0f0f0f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-8">
            Properties For Rent
          </h2>
          <RentProperties />
        </div>
      </section>
    </div>
  )
}