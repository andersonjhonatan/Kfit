import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { Intro } from '@/components/intro';
import { MotionProvider } from '@/components/motion';
import { BeforeAfter, Evolution, Faq, Features, FinalCta, HowItWorks, Marquee, Numbers, Plans, Simulator, YourBrand } from '@/components/sections';
import { Footer } from '@/components/footer';

export default function Home() {
  return (
    <MotionProvider>
      <Intro />
      <Header />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Simulator />
        <Features />
        <Evolution />
        <YourBrand />
        <Numbers />
        <BeforeAfter />
        <Plans />
        <Faq />
        <FinalCta />
      </main>
      <Footer />
    </MotionProvider>
  );
}
