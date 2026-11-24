import { Header } from '@/components/header';
import { Hero } from '@/components/hero';
import { Intro } from '@/components/intro';
import { MotionProvider } from '@/components/motion';
import { BeforeAfter, Evolution, Faq, Features, FinalCta, HowItWorks, Marquee, Numbers, Plans, Simulator, YourBrand } from '@/components/sections';
import { Logo } from '@/components/brand';
import { SITE } from '@/lib/site';

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
      <footer className="border-t border-line py-10">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-dim sm:flex-row">
          <Logo className="h-8 w-auto" />
          <p>KFit é um produto da TresK Tecnologia · Ibimirim-PE</p>
          <a href={`https://instagram.com/${SITE.instagram}`} className="hover:text-chalk">@{SITE.instagram}</a>
        </div>
      </footer>
    </MotionProvider>
  );
}
