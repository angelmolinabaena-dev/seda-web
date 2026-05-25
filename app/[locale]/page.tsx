import { Hero } from "@/components/hero"
import { ValueProp } from "@/components/value-prop"
import { ProjectsSection } from "@/components/projects-section"
import { EditorialBreak } from "@/components/editorial-break"
import { JourneySection } from "@/components/journey-section"
import { DualConversion } from "@/components/dual-conversion"
import { GuestAppSection } from "@/components/guest-app-section"
import { ServicesSlider } from "@/components/services-slider"
import { SedaOSSection } from "@/components/seda-os-section"
import { CommitmentsSection } from "@/components/commitments-section"
import { StudioSection } from "@/components/studio-section"
import { FaqSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
export default function Page() {
  return (
    <main id="main-content">
      <Hero />
      <ValueProp />
      <ProjectsSection />
      <EditorialBreak />
      <JourneySection />
      <DualConversion />
      <GuestAppSection />
      <ServicesSlider />
      <SedaOSSection />
      <CommitmentsSection />
      <StudioSection />
      <FaqSection />
      <ContactSection />
    </main>
  )
}
