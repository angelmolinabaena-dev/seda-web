/*
  SEDA's public contact + tourism-license data — single source of truth.

  Lives here (a plain, no-directive module) rather than in
  `components/footer.tsx` because that file is `"use client"`: Next.js
  turns every export of a client module into a client-reference at the
  server/client boundary, including plain constants — importing
  `generalContact` from footer.tsx into a Server Component (the
  Organization/LodgingBusiness JSON-LD in `app/[locale]/layout.tsx`)
  resolved to a stub object at build time (`generalContact.phone` was
  `undefined`), breaking `next build`. A neutral module is importable from
  both client and server code without that failure mode.
*/

export const generalContact = {
  email: "info@sedaprivatehomes.com",
  phone: "+34 686 980 798",
}

export const TOURISM_LICENSE = "VTAR/MA/27.143"
