"use client"

import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"

/*
  Footer link audit (post-migration):
  - Navigation column points to dedicated routes — NOT home-page anchors.
    Old `/#projects`, `/#guest-app`, `/#faq`, `/#contact` were hash links that
    only worked from `/`. From `/propietarios` they were broken.
  - Social column collapsed: placeholder `href="#"` removed (was a dead link
    from a UX & SEO standpoint). Will be re-introduced when real handles exist.
*/

const generalContact = {
  email: "info@sedaprivatehomes.com",
  phone: "+34 686 980 798",
}

export function Footer() {
  const t = useTranslations()
  const year = new Date().getFullYear()
  const footerLinks = [
    { label: t("home.footer.links.coleccion"),    href: "/coleccion" },
    { label: t("home.footer.links.ecosistema"),   href: "/ecosistema" },
    { label: t("home.footer.links.guestapp"),     href: "/guestapp" },
    { label: t("home.footer.links.experiencias"), href: "/experiencias" },
    { label: t("home.footer.links.propietarios"), href: "/propietarios" },
    { label: t("home.footer.links.descubre"),     href: "/descubre" },
    { label: t("home.footer.links.faq"),          href: "/faq" },
    { label: t("home.footer.links.contacto"),     href: "/contacto" },
  ]
  return (
    <footer className="px-6 py-16 md:px-12 lg:px-20 border-t border-border">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
        <div className="md:col-span-5">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.35em] uppercase text-foreground"
          >
            SEDA Private Homes
          </Link>
          <p className="text-sm leading-[1.75] text-muted-foreground mt-5 max-w-xs">
            {t("home.footer.tagline")}
          </p>
          <div className="mt-6 space-y-2">
            <a
              href={`mailto:${generalContact.email}`}
              className="block font-mono text-[12px] text-foreground/70 hover:text-foreground transition-colors"
            >
              {generalContact.email}
            </a>
            <a
              href={`tel:${generalContact.phone.replace(/\s/g, "")}`}
              className="block font-mono text-[12px] text-foreground/70 hover:text-foreground transition-colors"
            >
              {generalContact.phone}
            </a>
          </div>
        </div>

        <div className="md:col-span-4 md:col-start-7">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-5">
            {t("home.footer.navegacion")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="text-sm text-foreground/70 hover:text-foreground transition-colors duration-300"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="md:col-span-2 md:col-start-11">
          <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60 mb-5">
            {t("home.footer.cumplimiento")}
          </p>
          <div className="flex flex-col gap-2 font-mono text-[10px] tracking-[0.18em] uppercase text-muted-foreground/65">
            <span>RD 633/2021</span>
            <span>Modelo 179</span>
            <span>VTAR/MA/27.143</span>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-border space-y-4">
        <p className="text-[10.5px] leading-relaxed text-muted-foreground/55 max-w-3xl">
          {t("home.footer.disclaimer")}
        </p>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground/60">
            {t("home.footer.copyright", { year })}
          </p>
          <p className="font-mono text-[11px] tracking-[0.15em] text-muted-foreground/60">
            {t("home.footer.region")}
          </p>
        </div>
      </div>
    </footer>
  )
}
