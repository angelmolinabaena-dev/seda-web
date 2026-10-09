# Revisión de idioma (en, fr, de) · 2026-10-09

Modelo `claude-opus-5-5`, una sección de `messages/*.json` por llamada (sin `legal`), de usted, natural, mismo
significado que el español, ortografía y formatos. Regla de aplicación: se aplica lo que corrige significado,
gramática, ortografía o un calco claro; no se aplica lo meramente estilístico ni la terminología de negocio.

**Cobertura:** en completo; fr completo; **de hasta `nosotros`** (faltan `img`, `skip`, `lang`, `coleccion`, `exp`,
`descubre`, `faq`, `eco`, `notfound`, `breadcrumb`, `shortcuts`, `guias`); **es no revisado**. Se paró por el tope de coste.

**Coste:** 144.688 tokens de entrada + 96.662 de salida (51 llamadas; la salida incluye el razonamiento del modelo) =
**3,14 $ con 5/25 $ por millón** (tarifa asumida: no se conoce la de la consola). El tope era 3 $; la última llamada lo
superó en 0,14 $ porque el control se hace antes de cada llamada.

No aplicadas, por decisión de negocio: «liquidation(s)» en francés (propuestas: *relevé*, *reversement*, *décompte*,
contradictorias entre sí), «Guest App · En producción» (`In production` / `In Produktion`), espaciado de `%` en fr/de
y «Image illustrative» (rótulo de la decisión 3).

| Idioma | Clave | Aplicada | Antes | Propuesta |
|---|---|---|---|---|
| en | `coleccion.body` | No | Opening soon. In the meantime we publish no residences; if … | Opening soon. In the meantime, we are not listing any resid… |
| en | `contacto.selector` | No | — Who's writing? | — Who is getting in touch? |
| en | `contacto.type.owner.title` | No | I am an owner | I am a property owner |
| en | `contacto.type.owner.desc` | No | For premium owners on the Costa del Sol. | For owners of premium properties on the Costa del Sol. |
| en | `contacto.form.labels.services` | No | Services wanted | Services required |
| en | `contacto.form.placeholders.status` | No | Private use / rental / empty | Private use / rented out / vacant |
| en | `contacto.form.placeholders.organization` | Sí | Company, media, brand… | Company, media outlet, brand… |
| en | `contacto.form.placeholders.message` | No | Tell us your proposal. | Tell us about your proposal. |
| en | `descubre.manifesto.h2.line1` | No | Luxury is not in asking for everything. | Luxury is not about asking for everything. |
| en | `descubre.manifesto.h2.italic` | No | It is in everything being foreseen. | It is about everything being anticipated. |
| en | `descubre.manifesto.body` | No | SEDA was not created to grow quickly. It was created to def… | SEDA was not created to grow quickly. It was created to def… |
| en | `descubre.philo.pillars.p3.b` | No | Self-guided arrivals and departures. Discreet teams. Data i… | Self-guided arrivals and departures. Discreet teams. Data h… |
| en | `descubre.cta.prop.body` | Sí | Personalised valuation of your residence within 48 hours. | Personalised assessment of your residence within 48 hours. |
| en | `eco.h1.line1` | No | The operating system of | The operating system for |
| en | `eco.modules.items.m3.t` | Sí | Requests | Incidents |
| en | `eco.modules.items.m4.b` | Sí | Preventive scheduled, reactive recorded. | Preventive work scheduled, reactive work logged. |
| en | `eco.modules.items.m8.b` | No | Repetitive flows without human intervention. | Repetitive workflows with no human intervention. |
| en | `eco.benefits.items.guests.body` | No | Smart access, instant concierge, immediate assistance. An e… | Smart access, instant concierge, immediate assistance. An e… |
| en | `eco.benefits.items.seda.body` | No | Connected operations, automation of repetitive flows, propr… | Connected operations, automation of repetitive workflows, p… |
| en | `exp.catalog.h2.line1` | No | An | A catalogue |
| en | `exp.catalog.h2.italic` | No | activatable catalogue | on demand |
| en | `exp.catalog.items.chef.line` | Sí | Private chef, market-driven menus and Mediterranean tables. | Private chef, market-fresh menus and Mediterranean-style di… |
| en | `exp.catalog.items.beach.line` | Sí | Curated tables along the coast between Marbella and Sotogra… | Curated bookings along the coast between Marbella and Sotog… |
| en | `exp.catalog.items.golf.line` | Sí | Tee times on Costa del Sol and Sotogrande courses. | Tee times at courses on the Costa del Sol and in Sotogrande. |
| en | `exp.catalog.items.cultura.line` | No | Private visits, wineries, markets and Andalusian cuisine. | Private tours, wineries, markets and Andalusian cuisine. |
| en | `exp.how.steps.s1.b` | No | We capture preferences, allergies, the pace of the trip and… | We go over your preferences, allergies, travel pace and wis… |
| en | `exp.how.steps.s3.b` | No | We validate providers, schedules and details. No surprises,… | We validate providers, schedules and details. No surprises,… |
| en | `exp.how.steps.s4.b` | No | Coordinated in residence or at the destination, with minima… | Coordinated at the residence or at the destination, with mi… |
| en | `exp.access.image_alt` | Sí | Private table at a SEDA residence, intimate atmosphere afte… | Private table at a SEDA residence, intimate atmosphere at d… |
| en | `exp.access.body` | Sí | We work with a closed circle of chefs, beach clubs, venues … | We work with a closed circle of chefs, beach clubs, venues … |
| en | `faq.intro` | Sí | Resolving objections is part of the SEDA standard. If a que… | Resolving objections is part of the SEDA standard. If a que… |
| en | `faq.guests_items.q2.a` | Sí | Yes. Before arrival we activate your preferences and, durin… | Yes. Before your arrival we activate your preferences and, … |
| en | `faq.guests_items.q3.a` | No | With smart access and self-guided check-in. You will receiv… | With smart access and self check-in. You will receive detai… |
| en | `faq.guests_items.q4.a` | Sí | Access, property guide, instant concierge, real-time reques… | Access, property guide, instant concierge, real-time issue … |
| en | `faq.owners_items.q1.a` | Sí | We carry out an architectural, operational and revenue-pote… | We carry out an architectural, operational and revenue-pote… |
| en | `faq.cta.bottom.owner` | No | I am an owner | I'm an owner |
| en | `founder.bio` | No | Hotelier by training (Les Roches School of Hotel Management… | A hotelier by training (Les Roches School of Hotel Manageme… |
| en | `guestapp.hero.badge` | No | Guest App · In production | Guest App · Live |
| en | `guestapp.anatomy.stay_body` | Sí | Wi-Fi, climate, house rules, villa manual. | Wi-Fi, climate control, house rules, villa manual. |
| en | `guestapp.journey.steps.s5.b` | Sí | Considered departure, requests resolved centrally, friction… | An orderly departure, centralised issue reporting and frict… |
| en | `guestapp.screens.today_event_title` | Sí | Dinner with chef Alejandro | Dinner with Chef Alejandro |
| en | `guestapp.screens.discover_chip1` | No | Local agenda | What's on |
| en | `guestapp.screens.checkout_title_line1` | Sí | A considered | An orderly |
| en | `guestapp.features.h2.line1` | No | Details you do not see, | Details you don't see, |
| en | `guestapp.features.h2.italic` | No | but feel. | but you notice. |
| en | `guestapp.features.items.lock_b` | No | Nuki Smart Lock integrated. Temporary codes per stay. | Integrated Nuki Smart Lock. Temporary codes for each stay. |
| en | `guestapp.features.items.wifi_b` | Sí | Router details and connection QR in a single tap. | Router details and connection QR code in a single tap. |
| en | `guestapp.features.items.concierge_b` | No | Local SEDA team + Ask SEDA AI. Response under 2 min. | Local SEDA team + Ask SEDA AI. Responses in under 2 min. |
| en | `guestapp.features.items.lang_b` | No | ES · EN · DE · FR natively, no machine translation. | Native ES · EN · DE · FR, with no machine translation. |
| en | `guestapp.features.items.manual_b` | Sí | Climate, kitchen, pool, sauna — all documented. | Climate control, kitchen, pool, sauna — all documented. |
| en | `guestapp.features.items.exp_b` | Sí | Chef, massage, charter and golf, pre-bookable. | Chef, massage, boat trips and golf, all bookable in advance. |
| en | `guestapp.marquee.i6` | Sí | Smart climate | Smart climate control |
| en | `guestapp.marquee.i8` | No | Native villa manual | Built-in villa manual |
| en | `guestapp.final.cta_acceso` | No | Guest sign in | Guest access |
| en | `guias.index.intro` | No | Reference guides on the regulatory framework for vacation r… | Reference guides on the regulatory framework for holiday re… |
| en | `guias.index.h1.line2` | No | with clarity. | clearly. |
| en | `guias.index.empty_state` | No | We're preparing the first guides. Check back soon. | We are preparing our first guides. Please check back soon. |
| en | `home.hero.cta_propietario` | No | I am an owner | I'm an owner |
| en | `home.editorial.body2` | No | Owners receive a portal with P&L, settlements, pricing and … | We offer owners a portal with real-time P&L, settlements, p… |
| en | `home.journey.phase2.body` | No | Concierge 24/7, services, experiences and immediate assista… | 24/7 concierge, services, experiences and immediate assista… |
| en | `home.dual.owner_h3` | No | Your residence, managed with precision. Without being on to… | Your residence, managed with precision. Without you having … |
| en | `home.guestapp_section.feat.acceso.desc` | No | Self-guided arrival without waiting. Clear instructions fro… | Self-guided arrival with no waiting. Clear instructions fro… |
| en | `home.services.chef.line` | Sí | Market-driven dining and Mediterranean tables. | Market-fresh menus and Mediterranean-style dinners. |
| en | `home.services.transfer.line` | Sí | Discreet arrival to Málaga or Gibraltar, no waiting. | Discreet arrival at Málaga or Gibraltar, with no waiting. |
| en | `home.services.limpieza.line` | Sí | Digital inventory, considered care protocols. | Digital inventory and care protocols. |
| en | `home.os.h2.line2` | No | , but that coordinates everything. | , yet it coordinates everything. |
| en | `home.commitments.body` | No | We do not promise luxury. We define it by default, in every… | We do not promise luxury. It is our default, in every detai… |
| en | `home.commitments.items.personalization.body` | No | Preferences recorded before arrival. Services activated to … | Preferences recorded before arrival. Services tailored to y… |
| en | `home.faq.items.q1.a` | No | From the property or Contact form, with your dates, number … | Via the form on the property page or the Contact page, stat… |
| en | `home.faq.items.q3.a` | No | Yes. Before arrival we activate your preferences and, durin… | Yes. Before your arrival we activate your preferences and, … |
| en | `home.faq.items.q5.a` | No | We carry out an architectural, operational and revenue-pote… | We carry out an architectural, operational and revenue-pote… |
| en | `home.faq.items.q7.a` | No | Guest verification, specific insurance, digital inventory, … | Guest verification, dedicated insurance, digital inventory,… |
| en | `home.contactsec.h2` | No | We are a message away. | We're just a message away. |
| en | `home.contactsec.owner_body` | No | Onboarding to the portfolio, valuation and integrated manag… | Portfolio onboarding, valuation and a comprehensive managem… |
| en | `home.contactsec.owner_cta` | No | Speak as an owner | Talk to us as an owner |
| en | `img.illustrative` | No | Illustrative image | Image for illustrative purposes |
| en | `nav.acceso_huespedes` | No | Guest sign in | Guest sign-in |
| en | `nav.acceso_propietarios` | No | Owner sign in | Owner sign-in |
| en | `nosotros.question.caption` | Sí | — The question that founded Seda | — The question that gave rise to Seda |
| en | `nosotros.path.h2` | Sí | The road <i>to here</i> | The road <i>so far</i> |
| en | `nosotros.timeline.t1.period` | No | Training | Education |
| en | `nosotros.timeline.t1.body` | No | One of the most recognised hospitality schools in the world… | One of the most recognised hospitality schools in the world… |
| en | `nosotros.timeline.t2.body` | No | Operational management in properties of a multinational cha… | Operational management at properties within a multinational… |
| en | `nosotros.timeline.t4.body` | No | Second property under development. The continuation of the … | Second property under development. A continuation of the in… |
| en | `nosotros.hotel.body` | Sí | Boutique hotel of 36 rooms facing La Rada beach, Estepona. … | A 36-room boutique hotel facing La Rada beach in Estepona. … |
| en | `nosotros.platform.n2.body` | No | Clear monthly settlement, occupancy above the market and re… | Clear monthly settlement, above-market occupancy and real-t… |
| en | `nosotros.awards.body` | Sí | Five consecutive awards — not for marketing, but for the on… | Five consecutive awards — not for marketing, but for the on… |
| en | `nosotros.cta.body` | No | Tell me which property you have in mind or what stay you ar… | Tell me which property you have in mind or what kind of sta… |
| en | `notfound.description` | No | This page has taken a moment. Return home or explore the co… | This page is taking a moment. Return to the homepage or exp… |
| en | `notfound.h1_line1` | No | This page has taken | This page is taking |
| en | `notfound.body` | Sí | The link may have changed or the address may no longer exis… | The link may have changed or the address may not exist. Ret… |
| en | `notfound.see_collection` | No | See the collection | View the collection |
| en | `prop.trust.items.trace.b` | Sí | Immutable log of every action and request. | Immutable log of every action and incident. |
| en | `prop.trust.items.access.b` | Sí | Digital registration and remote revocation of access. | Digital access logging and remote revocation. |
| en | `prop.trust.body` | Sí | Complete peace of mind. We automate the management of the l… | Complete peace of mind. We automate the management of the l… |
| en | `prop.arch.mod.operacion.body` | Sí | Housekeeping, maintenance, gardening and local-team routing… | Assignment of housekeeping, maintenance and gardening, plus… |
| en | `prop.os.see_calendar` | No | See calendar → | View calendar → |
| en | `prop.marketing.non_resident_body` | No | Specific content for international guests and investors. | Dedicated content for international guests and investors. |
| en | `prop.sim.disclaimer` | Sí | ⓘ Estimate calculated solely from the occupancy and ADR you… | ⓘ Estimate calculated solely from the occupancy and ADR you… |
| en | `prop.sim.net_note` | Sí | The 24% applies only to the accommodation fee: we deduct th… | The 24% applies only to the accommodation fee: we first ded… |
| en | `prop.faq.items.q1.a` | Sí | We apply a 24% commission on the accommodation revenue, aft… | We apply a 24% commission on the accommodation revenue, aft… |
| en | `prop.faq.items.q4.a` | Sí | No. The entire process (valuation, contract, onboarding, ph… | No. The entire process (valuation, contract, onboarding, ph… |
| en | `prop.faq.items.q6.a` | No | We assess architecture, location, privacy, local operationa… | We assess architecture, location, privacy, local operationa… |
| en | `prop.faq.items.q7.a` | Sí | Sixty days' notice, no penalties. Confirmed bookings are ho… | Sixty days' notice, no penalties. Confirmed bookings are ho… |
| en | `prop.final.body` | Sí | A confidential potential analysis within 48 hours. No commi… | A confidential analysis of your property's potential within… |
| en | `prop.final.acceso` | No | Owner sign in | Owner sign-in |
| en | `shortcuts.intro` | No | Press a combination to navigate. | Press a key combination to navigate. |
| fr | `coleccion.body` | No | Prochaine ouverture. En attendant, nous ne publions aucune … | Ouverture prochaine. En attendant, nous ne publions aucune … |
| fr | `contacto.selector` | Sí | — Qui écrit ? | — Qui nous écrit ? |
| fr | `contacto.error.send` | Sí | Nous n'avons pas pu envoyer votre message. Veuillez réessay… | Nous n'avons pas pu envoyer votre message. Veuillez réessay… |
| fr | `contacto.type.owner.desc` | Sí | Pour les propriétaires premium sur la Costa del Sol. | Pour les propriétaires de biens haut de gamme sur la Costa … |
| fr | `contacto.form.labels.email` | No | Email | E-mail |
| fr | `contacto.form.labels.status` | No | Statut actuel | Situation actuelle |
| fr | `contacto.form.placeholders.status` | No | Usage privé / location / vide | Usage privé / location / inoccupée |
| fr | `cta.solicitar_estancia` | No | Demander un séjour | Faire une demande de séjour |
| fr | `descubre.h1.line1` | No | Le | Le standard |
| fr | `descubre.h1.italic1` | No | standard invisible | invisible |
| fr | `descubre.manifesto.h2.line1` | Sí | Le luxe n'est pas dans tout demander. | Le luxe, ce n'est pas de tout demander. |
| fr | `descubre.manifesto.h2.italic` | Sí | Il est dans le fait que tout soit prévu. | C'est que tout soit prévu. |
| fr | `descubre.manifesto.body` | Sí | SEDA n'a pas été créé pour croître vite. Il a été créé pour… | SEDA n'a pas été créé pour croître vite. Il a été créé pour… |
| fr | `descubre.what.items.i1.b` | Sí | Nous ne vivons pas du volume ni des commissions croisées av… | Nous ne vivons ni du volume ni des commissions croisées ave… |
| fr | `descubre.philo.h2.line1` | Sí | Six piliers. Une | Six piliers. Une seule |
| fr | `descubre.philo.pillars.p2.b` | No | Des personnes réelles, une présence minimale, une attention… | Des personnes réelles, une présence minimale, une attention… |
| fr | `descubre.cta.huesped.h3.line1` | No | Voir la | Découvrir la |
| fr | `eco.body` | No | Une couche invisible qui relie réservations, voyageurs, pro… | Une couche invisible qui relie réservations, voyageurs, pro… |
| fr | `eco.modules.h2.line1` | Sí | Huit modules. Une | Huit modules. Une seule |
| fr | `eco.modules.intro` | No | Chaque module est relié au suivant. Chaque action laisse un… | Chaque module est relié au suivant. Chaque action laisse un… |
| fr | `eco.modules.items.m1.b` | Sí | Marketing, contrats, acomptes. | Commercialisation, contrats, acomptes. |
| fr | `eco.modules.items.m3.t` | Sí | Demandes | Incidents |
| fr | `eco.modules.items.m6.t` | No | Liquidations | Décomptes |
| fr | `eco.benefits.h2.line1` | Sí | Une technologie. Trois | Une seule technologie. Trois |
| fr | `eco.benefits.items.guests.title` | Sí | Plus de fluidité, | Plus de rapidité, |
| fr | `eco.benefits.items.seda.body` | Sí | Opérations connectées, automatisation des flux répétitifs, … | Opérations connectées, automatisation des flux répétitifs, … |
| fr | `exp.body` | Sí | Du chef privé aux beach clubs, en passant par le bien-être,… | Du chef privé aux beach clubs, en passant par le bien-être,… |
| fr | `exp.catalog.items.beach.line` | Sí | Tables éditées le long de la côte entre Marbella et Sotogra… | Réservations triées sur le volet le long de la côte, entre … |
| fr | `exp.catalog.items.transfer.line` | No | Véhicules discrets, arrivées aéroport sans attente. | Véhicules discrets, accueil à l'aéroport sin attente. |
| fr | `exp.catalog.items.golf.line` | No | Départs sur les parcours de la Costa del Sol et de Sotogran… | Réservation de départs sur les parcours de la Costa del Sol… |
| fr | `exp.catalog.items.familias.line` | Sí | Gouvernantes, activités enfants, équipement sur demande. | Baby-sitters, activités pour enfants, équipement sur demand… |
| fr | `exp.how.steps.s2.b` | No | Toute demande passe par la Guest App. Une équipe dédiée est… | Toute demande passe par la Guest App. Une équipe dédiée est… |
| fr | `exp.access.body` | Sí | Nous travaillons avec un cercle fermé de chefs, beach clubs… | Nous travaillons avec un cercle fermé de chefs, de beach cl… |
| fr | `faq.intro` | Sí | Lever les objections fait partie du standard SEDA. Si une q… | Lever les objections fait partie du standard SEDA. Si votre… |
| fr | `faq.cta.bottom.h2.italic` | No | Échangeons. | Parlons-en. |
| fr | `faq.guests_items.q2.a` | Sí | Oui. Avant l'arrivée nous activons vos préférences et, pend… | Oui. Avant votre arrivée, nous activons vos préférences et,… |
| fr | `faq.guests_items.q4.a` | Sí | Accès, guide de la propriété, conciergerie instantanée, jou… | Accès, guide de la propriété, conciergerie instantanée, sig… |
| fr | `faq.guests_items.q5.q` | Sí | Que se passe-t-il si quelque chose nécessite votre attentio… | Que se passe-t-il en cas d'incident ? |
| fr | `faq.owners_items.q2.a` | No | Nous appliquons une commission de 24% sur l'hébergement de … | Nous appliquons une commission de 24 % sur l'hébergement de… |
| fr | `faq.owners_items.q3.a` | No | Depuis le Portail Propriétaires, en temps réel : revenus pr… | Depuis le Portail Propriétaires, en temps réel : revenus pr… |
| fr | `faq.owners_items.q4.a` | Sí | L'équipe SEDA, avec son propre réseau de prestataires certi… | L'équipe SEDA, avec son propre réseau de prestataires certi… |
| fr | `faq.owners_items.q5.a` | Sí | Vérification des voyageurs, assurance spécifique, inventair… | Vérification des voyageurs, assurances spécifiques, inventa… |
| fr | `founder.bio` | Sí | Hôtelier de formation (Les Roches School of Hotel Managemen… | Hôtelier de formation (Les Roches School of Hotel Managemen… |
| fr | `founder.cred2` | No | Iberostar · 8+ ans | Iberostar · Plus de 8 ans |
| fr | `guestapp.hero.h1.line2` | Sí | dans la poche de votre voyageur. | dans la poche du voyageur. |
| fr | `guestapp.hero.body` | Sí | De l'arrivée au check-out, chaque instruction, code, recomm… | De l'arrivée au check-out, chaque instruction, code, recomm… |
| fr | `guestapp.anatomy.h2.italic` | Sí | Un séjour. | Un seul séjour. |
| fr | `guestapp.anatomy.discover_body` | Sí | La Costa del Sol éditée par SEDA : manger, faire, voir. | La Costa del Sol sélectionnée par SEDA : manger, faire, voi… |
| fr | `guestapp.journey.steps.s4.b` | Sí | Recommandations locales, restaurants, beach clubs et expéri… | Recommandations locales, restaurants, beach clubs et expéri… |
| fr | `guestapp.journey.steps.s5.b` | Sí | Départ réfléchi, demandes résolues centralement, communicat… | Départ organisé, incidents centralisés, communication sans … |
| fr | `guestapp.screens.today_greeting_line1` | No | Bon après-midi, | Bonjour, |
| fr | `guestapp.screens.today_event_sub` | No | Terrasse · 4 voyageurs · confirmé | Terrasse · 4 personnes · confirmé |
| fr | `guestapp.screens.ask_title_line1` | No | Conciergerie, | Conciergerie |
| fr | `guestapp.screens.checkout_title_italic` | Sí | réfléchi. | organisé. |
| fr | `guestapp.screens.checkout_event_title` | No | Heure de check-out | Heure de départ |
| fr | `guestapp.screens.discover_title_italic` | Sí | édité. | sélectionné. |
| fr | `guestapp.features.items.exp_b` | Sí | Chef, massage, charter et golf, réservables à l'avance. | Chef, massage, bateau et golf, réservables à l'avance. |
| fr | `guestapp.marquee.i8` | No | Manuel natif de la villa | Manuel de la villa intégré |
| fr | `guias.ficha.volver` | Sí | Retour aux Guides | Retour aux guides |
| fr | `home.value.body` | Sí | Redéfinir l'hospitalité sur la Costa del Sol — des résidenc… | Nous redéfinissons l'hospitalité sur la Costa del Sol — des… |
| fr | `home.editorial.h2` | Sí | Gestion de villas privées sur la Costa del Sol, opérée sur … | Gestion de villas privées sur la Costa del Sol, pilotée par… |
| fr | `home.editorial.body2` | No | Les propriétaires disposent d'un portail avec compte de rés… | Les propriétaires disposent d'un portail avec compte de rés… |
| fr | `home.journey.eyebrow` | No | — 03 · Le voyage | — 03 · Le parcours |
| fr | `home.journey.phase1.body` | No | Accès, préférences, transferts, garnissage du garde-manger … | Accès, préférences, transferts, premières courses et prépar… |
| fr | `home.journey.phase3.body` | Sí | Check-out sans effort, retours, suivi personnel et préparat… | Check-out sans effort, retours, suivi personnalisé et prépa… |
| fr | `home.guestapp_section.body` | Sí | Une interface unique pour tout ce qui se passe avant, penda… | Une interface unique pour tout ce qui se passe avant, penda… |
| fr | `home.guestapp_section.feat.incidencias.title` | Sí | Demandes en temps réel | Signalements en temps réel |
| fr | `home.guestapp_section.feat.experiencias.desc` | Sí | Sélection éditoriale de gastronomie, culture et bien-être. | Une sélection pointue de gastronomie, culture et bien-être. |
| fr | `home.services.alt_suffix` | No | Service Seda Private Homes | service Seda Private Homes |
| fr | `home.os.body` | Sí | Une couche propriétaire qui relie réservations, voyageurs, … | Notre propre couche logicielle, qui relie réservations, voy… |
| fr | `home.os.modules.liquidaciones` | No | Liquidations | Reversements |
| fr | `home.dual.owner_body` | No | Suivez l'occupation, les revenus, la maintenance, les avis … | Suivez l'occupation, les revenus, la maintenance, les avis … |
| fr | `home.dashboard.kpi.reservas_sub` | No | 90 prochains jours | Les 90 prochains jours |
| fr | `home.dashboard.calendar.range` | No | Juil — Sept 2026 | Juil.–sept. 2026 |
| fr | `home.dashboard.liquidacion.title` | No | Liquidation · Juin 2026 | Reversement · Juin 2026 |
| fr | `home.dashboard.liquidacion.row4` | No | Net au propriétaire | Net reversé au propriétaire |
| fr | `home.commitments.h2.line1` | No | Cinq engagements. Un | Cinq engagements. Une seule |
| fr | `home.commitments.h2.italic` | No | standard. | exigence. |
| fr | `home.commitments.body` | Sí | Nous ne promettons pas le luxe. Nous le définissons par déf… | Nous ne promettons pas le luxe. Nous en faisons la norme, d… |
| fr | `home.commitments.items.privacy.body` | Sí | Arrivées et départs autonomes. Équipes discrètes. Données p… | Arrivées et départs autonomes. Équipes discrètes. Données p… |
| fr | `home.commitments.items.calm.body` | Sí | Séjours sans friction. Assistance immédiate. La sensation q… | Séjours sans friction. Assistance immédiate. La sensation q… |
| fr | `home.studio.h2.line1` | Sí | Votre villa, opérée avec la | Votre villa, gérée avec la |
| fr | `home.studio.body` | Sí | Logiciel propriétaire, équipe locale sur la Costa del Sol e… | Notre propre logiciel, une équipe locale sur la Costa del S… |
| fr | `home.studio.cta` | No | Voir le modèle | Découvrir le modèle |
| fr | `home.faq.items.q3.a` | No | Oui. Avant l'arrivée nous activons vos préférences et, pend… | Oui. Avant votre arrivée, nous activons vos préférences et,… |
| fr | `home.faq.items.q4.q` | Sí | Que se passe-t-il si quelque chose nécessite votre attentio… | Que se passe-t-il en cas d'incident ? |
| fr | `home.faq.items.q6.a` | No | Depuis le Portail Propriétaires, en temps réel : revenus pr… | Depuis le Portail Propriétaires, en temps réel : revenus pr… |
| fr | `home.contactsec.h2` | Sí | Nous sommes à un message près. | Nous sommes à portée de message. |
| fr | `home.contactsec.guest_body` | No | Réservations, conciergerie et attention personnelle en cinq… | Réservations, conciergerie et accompagnement personnalisé e… |
| fr | `home.contactsec.owner_cta` | No | Parler en tant que propriétaire | Échanger en tant que propriétaire |
| fr | `home.footer.tagline` | Sí | Hospitalité méditerranéenne, opérée sur logiciel propriétai… | Hospitalité méditerranéenne, pilotée par notre propre logic… |
| fr | `img.illustrative` | No | Image illustrative | Image à titre d'illustration |
| fr | `nosotros.question.caption` | Sí | — La question qui a fondé Seda | — La question à l'origine de Seda |
| fr | `nosotros.timeline.t2.period` | No | 8+ ans | Plus de 8 ans |
| fr | `nosotros.timeline.t2.body` | No | Gestion opérationnelle dans des établissements d'une chaîne… | Gestion opérationnelle dans des établissements d'une chaîne… |
| fr | `nosotros.timeline.t3.body` | Sí | Propriétaire-exploitant d'un hôtel boutique de 36 chambres … | Propriétaire-exploitant d'un hôtel boutique de 36 chambres … |
| fr | `nosotros.timeline.t4.body` | Sí | Deuxième établissement en développement. La continuité du m… | Deuxième établissement en développement. Le prolongement du… |
| fr | `nosotros.platform.n1.body` | No | Arrivée, climatisation, réservations et expériences — tout … | Arrivée, climatisation, réservations et expériences — tout … |
| fr | `nosotros.platform.n2.body` | No | Liquidation mensuelle claire, taux d'occupation supérieur a… | Relevé mensuel clair, taux d'occupation supérieur au marché… |
| fr | `nosotros.awards.h2` | No | La mesure d'<i>un métier bien fait</i>. | La mesure du <i>travail bien fait</i>. |
| fr | `nosotros.awards.body` | No | Cinq distinctions consécutives — non pour le marketing, mai… | Cinq distinctions consécutives — non pas grâce au marketing… |
| fr | `nosotros.cta.body` | No | Dites-moi quelle propriété vous avez en tête ou quel séjour… | Dites-moi quelle propriété vous avez en tête ou quel séjour… |
| fr | `notfound.description` | No | Cette page prend un instant. Revenez à l'accueil ou explore… | Cette page s'est éclipsée un instant. Revenez à l'accueil o… |
| fr | `notfound.h1_line1` | No | Cette page prend | Cette page s'est éclipsée |
| fr | `notfound.body` | Sí | Le lien a peut-être changé ou l'adresse n'existe plus. Reve… | Le lien a peut-être changé ou l'adresse n'existe pas. Reven… |
| fr | `prop.hero.eyebrow` | No | — SEDA Propriétaires | — Propriétaires SEDA |
| fr | `prop.hero.body` | No | SEDA OS est la couche logicielle propriétaire qui orchestre… | SEDA OS est notre propre couche logicielle, qui orchestre r… |
| fr | `prop.os.live` | No | SEDA OS · LIVE | SEDA OS · EN DIRECT |
| fr | `prop.os.kpi.mant_d` | Sí | CVC | Climatisation |
| fr | `prop.os.liq_title` | No | Prochaine liquidation | Prochain reversement |
| fr | `prop.os.liq_sepa` | No | SEPA · 01 Nov | SEPA · 1er nov. |
| fr | `prop.os.ga_title` | No | État Guest App | État de la Guest App |
| fr | `prop.os.ga_clima` | Sí | CVC | Climatisation |
| fr | `prop.os.session_detail` | No | M. Andersen · 4 voyageurs · check-in 16h00 | M. Andersen · 4 voyageurs · check-in 16 h |
| fr | `prop.marketing.compset_body` | No | Suivi du compset Costa del Sol. | Suivi du compset de la Costa del Sol. |
| fr | `prop.marketing.non_resident_h3` | No | Non-Résidents | Non-résidents |
| fr | `prop.trust.items.m179.b` | Sí | Préparation des déclarations informatives de location touri… | Préparation des déclarations d'information relatives à la l… |
| fr | `prop.trust.items.trace.b` | Sí | Journal immuable de chaque action et demande. | Journal immuable de toutes les actions et de tous les incid… |
| fr | `prop.arch.h2.italic` | Sí | Un système. | Un seul système. |
| fr | `prop.arch.mod.operacion.body` | Sí | Entretien, maintenance, jardinage et affectation des équipe… | Affectation du ménage, de la maintenance, du jardinage et d… |
| fr | `prop.arch.mod.marketing.body` | Sí | Gestion OTA, SEO, tarification dynamique et campagnes inter… | Gestion des OTA, SEO, tarification dynamique et campagnes i… |
| fr | `prop.arch.mod.finanzas.label` | No | Liquidations | Reversements |
| fr | `prop.arch.mod.finanzas.body` | No | Liquidations automatisées, rapprochement bancaire, IRNR et … | Reversements automatisés, rapprochement bancaire, IRNR et r… |
| fr | `prop.sim.occupancy_tick_low` | No | Conservatrice (20%) | Conservatrice (20 %) |
| fr | `prop.sim.occupancy_tick_high` | No | Optimale (95%) | Optimale (95 %) |
| fr | `prop.sim.adr_tick_high` | No | 5 000 €+ | 5 000 € et plus |
| fr | `prop.sim.net` | No | Net au propriétaire (OTA – direct) | Net pour le propriétaire (OTA – direct) |
| fr | `prop.sim.disclaimer` | No | ⓘ Estimation calculée uniquement à partir du taux d'occupat… | ⓘ Estimation calculée uniquement à partir du taux d'occupat… |
| fr | `prop.sim.net_note` | No | Les 24% s'appliquent uniquement à l'hébergement : nous dédu… | Les 24 % s'appliquent uniquement à l'hébergement : nous déd… |
| fr | `prop.faq.items.q1.a` | No | Nous appliquons une commission de 24% sur l'hébergement, ap… | Nous appliquons une commission de 24 % sur l'hébergement, a… |
| fr | `prop.faq.items.q2.a` | Sí | Une équipe SEDA salariée localement sur la Costa del Sol, d… | Une équipe SEDA salariée localement sur la Costa del Sol, d… |
| fr | `prop.faq.items.q3.a` | Sí | SEDA OS prépare les déclarations informatives de location t… | SEDA OS prépare les déclarations d'information relatives à … |
| fr | `prop.faq.items.q4.a` | Sí | Non. L'ensemble du processus (évaluation, contrat, onboardi… | Non. L'ensemble du processus (évaluation, contrat, mise en … |
| fr | `prop.faq.items.q5.a` | Sí | Oui. Bloquez les dates dans SEDA OS ou le Portail Propriéta… | Oui. Bloquez les dates dans SEDA OS ou dans le Portail Prop… |
| fr | `prop.faq.items.q6.a` | Sí | Nous évaluons l'architecture, l'emplacement, la confidentia… | Nous évaluons l'architecture, l'emplacement, l'intimité, la… |
| fr | `prop.faq.items.q7.q` | Sí | Que faire si je souhaite mettre fin à l'accord ? | Que se passe-t-il si je souhaite résilier le contrat ? |
| fr | `prop.final.body` | Sí | Une analyse confidentielle du potentiel sous 48 heures. San… | Une analyse confidentielle du potentiel sous 48 heures. San… |
| de | `contacto.selector` | Sí | — Wer schreibt? | — Wer schreibt uns? |
| de | `contacto.type.owner.desc` | Sí | Für Premium-Eigentümer an der Costa del Sol. | Für Eigentümer von Premium-Immobilien an der Costa del Sol. |
| de | `founder.bio` | No | Hotelier von Ausbildung (Les Roches School of Hotel Managem… | Ausgebildeter Hotelier (Les Roches School of Hotel Manageme… |
| de | `guestapp.hero.badge` | No | Guest App · In Produktion | Guest App · Im Live-Betrieb |
| de | `guestapp.hero.body` | No | Von der Ankunft bis zum Check-out lebt jede Anweisung, jede… | Von der Ankunft bis zum Check-out finden sich alle Anweisun… |
| de | `guestapp.hero.cta.explorar` | Sí | Kollektion durchstöbern | Kollektion entdecken |
| de | `guestapp.anatomy.h2.italic` | Sí | Ein Aufenthalt. | Ein einziger Aufenthalt. |
| de | `guestapp.anatomy.body` | No | Das gesamte Erlebnis ist in fünf Pfade gegliedert: Alltag, … | Das gesamte Erlebnis ist in fünf Bereiche gegliedert: Tages… |
| de | `guestapp.anatomy.stay_body` | Sí | WLAN, Klima, Hausordnung, Villenhandbuch. | WLAN, Klimaanlage, Hausordnung, Villenhandbuch. |
| de | `guestapp.anatomy.discover_body` | Sí | Die Costa del Sol kuratiert von SEDA: essen, erleben, sehen. | Die Costa del Sol, kuratiert von SEDA: essen, erleben, sehe… |
| de | `guestapp.journey.eyebrow` | No | — Die Gastreise | — Die Reise des Gastes |
| de | `guestapp.journey.body` | No | Sticky Scroll. Fünf reale Bildschirme — jeder erscheint, we… | Sticky Scroll. Fünf echte Screens – jeder erscheint genau i… |
| de | `guestapp.journey.steps.s1.b` | No | Geführte Ankunft, Adresse, Karte und klare Codes, bevor ein… | Geführte Ankunft, Adresse, Karte und klare Codes, noch bevo… |
| de | `guestapp.journey.steps.s3.b` | No | Der Gast fragt einen Koch, eine Massage, einen Transfer ode… | Der Gast fragt einen Koch, eine Massage, einen Transfer ode… |
| de | `guestapp.journey.steps.s4.tag` | No | 04 · WÄHREND | 04 · WÄHRENDDESSEN |
| de | `guestapp.journey.steps.s5.b` | Sí | Bedachte Abreise, zentral gelöste Anfragen, reibungslose Ko… | Geordnete Abreise, zentral gebündelte Meldungen und reibung… |
| de | `guestapp.screens.today_greeting_line1` | No | Guten Nachmittag, | Guten Tag, |
| de | `guestapp.screens.stay_item1` | No | Anweisungen zur Villa | Hinweise zur Villa |
| de | `guestapp.screens.stay_item3` | No | Vorfall melden | Problem melden |
| de | `guestapp.screens.discover_place1_s` | No | Essen · 4 Min. | Gastronomie · 4 Min. |
| de | `guestapp.screens.discover_place3_s` | No | Lokal · 12 Min. | Lokales · 12 Min. |
| de | `guestapp.screens.checkout_title_line1` | Sí | Eine bedachte | Eine geordnete |
| de | `guestapp.screens.checkout_item1_t` | No | Vorfall melden | Problem melden |
| de | `guestapp.screens.checkout_thanks` | No | Danke für Ihren Aufenthalt. | Vielen Dank für Ihren Aufenthalt. |
| de | `guestapp.features.items.wifi_b` | No | Router-Details und Verbindungs-QR auf einen Tipp. | Router-Details und QR-Code zum Verbinden mit einem Fingerti… |
| de | `guestapp.features.items.exp_b` | Sí | Koch, Massage, Charter und Golf, vorab buchbar. | Koch, Massage, Bootsausflug und Golf – vorab buchbar. |
| de | `guestapp.features.items.manual_b` | Sí | Klima, Küche, Pool, Sauna — alles dokumentiert. | Klimaanlage, Küche, Pool, Sauna – alles dokumentiert. |
| de | `guestapp.marquee.i7` | No | Unterstützung 24/7 | 24/7-Support |
| de | `guestapp.marquee.i8` | No | Natives Villenhandbuch | Integriertes Villenhandbuch |
| de | `home.journey.phase1.body` | Sí | Zugang, Präferenzen, Transfer, Vorratsausstattung und Vorbe… | Zugang, Präferenzen, Transfer, Vorratsausstattung und Vorbe… |
| de | `home.journey.phase2.body` | No | Concierge 24/7, Services, Erlebnisse und sofortige Unterstü… | 24/7-Concierge, Services, Erlebnisse und sofortige Unterstü… |
| de | `home.dual.guest_body` | No | Selbstgeführte Anreise, Concierge 24/7, lokale Erlebnisse u… | Eigenständige Anreise, 24/7-Concierge, lokale Erlebnisse un… |
| de | `home.dual.owner_h3` | Sí | Ihre Residenz, mit Präzision verwaltet. Ohne sich darum küm… | Ihre Residenz, mit Präzision verwaltet. Ohne dass Sie sich … |
| de | `home.guestapp_section.h2.line1` | Sí | Ihr Aufenthalt, in der | Ihr Aufenthalt, ganz in |
| de | `home.guestapp_section.h2.italic` | Sí | Handfläche. | Ihrer Hand. |
| de | `home.guestapp_section.body` | Sí | Eine einzige Oberfläche für alles, was vor, während und nac… | Eine einzige Oberfläche für alles, was vor, während und nac… |
| de | `home.guestapp_section.feat.acceso.desc` | No | Selbstgeführte Anreise ohne Wartezeit. Klare Anweisungen ab… | Eigenständige Anreise ohne Wartezeit. Klare Anweisungen ab … |
| de | `home.guestapp_section.feat.concierge.desc` | No | Koch, Massage, Transfer oder Reservierung mit wenigen Klick… | Koch, Massage, Transfer oder Reservierung mit wenigen Finge… |
| de | `home.services.body` | Sí | Jeder Service wird über die Guest App angefragt und von uns… | Jeder Service wird über die Guest App angefragt und von uns… |
| de | `home.services.transfer.italic` | Sí | transfer | Transfer |
| de | `home.services.beach_clubs.title` | Sí | Beach Club- | Beachclub- |
| de | `home.services.beach_clubs.italic` | Sí | reservierungen | Reservierungen |
| de | `home.services.limpieza.line` | Sí | Digitales Inventar, durchdachte Pflegeprotokolle. | Digitales Inventar, Pflegeprotokolle. |
| de | `home.dashboard.status.details` | Sí | 0 offene Vorgänge 3 präventive Kontrollen | 0 offene Vorgänge 3 vorbeugende Wartungen |
| de | `home.commitments.body` | Sí | Wir versprechen keinen Luxus. Wir definieren ihn standardmä… | Wir versprechen keinen Luxus. Bei uns ist er Standard – in … |
| de | `home.commitments.items.privacy.body` | No | Selbstgeführte An- und Abreise. Diskrete Teams. Daten gesch… | Eigenständige An- und Abreise. Diskrete Teams. Daten geschü… |
| de | `home.commitments.items.precision.body` | No | Vom SEDA OS koordinierter Betrieb. Jeder Schritt wird antiz… | Von SEDA OS koordinierter Betrieb. Jeder Schritt wird antiz… |
| de | `home.commitments.items.calm.body` | Sí | Reibungslose Aufenthalte. Sofortige Unterstützung. Das Gefü… | Reibungslose Aufenthalte. Sofortige Unterstützung. Das Gefü… |
| de | `home.faq.items.q1.a` | Sí | Über das Immobilien- oder Kontaktformular, mit Ihren Daten,… | Über das Immobilien- oder Kontaktformular, unter Angabe von… |
| de | `home.faq.items.q2.a` | No | Mit intelligentem Zugang und selbstgeführtem Check-in. Sie … | Mit intelligentem Zugang und Self-Check-in. Sie erhalten de… |
| de | `home.faq.items.q3.a` | Sí | Ja. Vor der Ankunft aktivieren wir Ihre Präferenzen, und wä… | Ja. Vor Ihrer Ankunft aktivieren wir Ihre Präferenzen, und … |
| de | `home.faq.items.q4.q` | Sí | Was geschieht, wenn etwas Aufmerksamkeit erfordert? | Was passiert, wenn es ein Problem gibt? |
| de | `home.faq.items.q7.a` | Sí | Gästeverifizierung, spezifische Versicherung, digitales Inv… | Gästeverifizierung, spezielle Versicherungen, digitales Inv… |
| de | `home.contactsec.owner_cta` | No | Als Eigentümer sprechen | Als Eigentümer Kontakt aufnehmen |
| de | `nav.ecosistema` | No | SEDA OS Ökosystem | Ökosystem SEDA OS |
| de | `nav.guias` | No | Leitfäden | Ratgeber |
| de | `nosotros.meta_description` | No | Hotelier. Hinter dem Hotel Estepona Plaza, Jahr für Jahr au… | Hotelier. Der Kopf hinter dem Hotel Estepona Plaza, das Jah… |
| de | `nosotros.hero.lead` | No | Hotelier. Hinter dem <b>Hotel Estepona Plaza</b>, Jahr für … | Hotelier. Der Kopf hinter dem <b>Hotel Estepona Plaza</b>, … |
| de | `nosotros.question.caption` | Sí | — Die Frage, die Seda gegründet hat | — Die Frage, aus der Seda entstand |
| de | `nosotros.question.p1` | Sí | Nach Jahren in der Hotelleitung bei Iberostar und der Gründ… | Nach Jahren in der Hotelleitung bei Iberostar und der Gründ… |
| de | `nosotros.question.p2` | No | Die Eigentümer verdienten Hotelbetrieb. Die Gäste verdiente… | Die Eigentümer hatten einen echten Hotelbetrieb verdient. D… |
| de | `nosotros.timeline.t2.body` | No | Operative Leitung in Häusern einer multinationalen Kette. D… | Operative Leitung in Häusern einer multinationalen Kette. D… |
| de | `nosotros.timeline.t3.body` | No | Eigentümer-Betreiber eines Boutique-Hotels mit 36 Zimmern i… | Eigentümer-Betreiber eines Boutique-Hotels mit 36 Zimmern i… |
| de | `nosotros.hotel.k2` | No | Durchschnittsnote Booking · TripAdvisor | Durchschnittsbewertung Booking · TripAdvisor |
| de | `nosotros.platform.n1.body` | Sí | Anreise, Klimatisierung, Buchungen und Erlebnisse — alles i… | Anreise, Klimatisierung, Buchungen und Erlebnisse — alles i… |
| de | `nosotros.platform.n2.title` | No | Rendite, ganz leise. | Rendite, ganz diskret. |
| de | `nosotros.awards.h2` | Sí | Das Maß für <i>ein gut gemachtes Handwerk</i>. | Woran sich <i>gutes Handwerk</i> messen lässt. |
| de | `nosotros.awards.body` | Sí | Fünf aufeinanderfolgende Auszeichnungen — nicht für das Mar… | Fünf Auszeichnungen in Folge — nicht dank Marketing, sonder… |
| de | `nosotros.cta.body` | Sí | Sagen Sie mir, welche Immobilie Sie im Sinn haben oder welc… | Erzählen Sie mir, welche Immobilie Sie im Sinn haben oder w… |
| de | `prop.hero.eyebrow` | Sí | — SEDA Eigentümer | — SEDA-Eigentümer |
| de | `prop.hero.body` | Sí | SEDA OS ist die eigene Software-Schicht, die Buchungen, Bet… | SEDA OS ist unsere hauseigene Softwareschicht, die Buchunge… |
| de | `prop.os.kpi.mant_d` | Sí | HLK | Klimaanlage |
| de | `prop.os.ga_title` | No | Guest App Status | Guest-App-Status |
| de | `prop.os.ga_clima` | Sí | HLK | Klimaanlage |
| de | `prop.marketing.desc_body` | Sí | Editorial verfasste Texte, die das Besondere Ihrer Immobili… | Redaktionelle Texte, die das Besondere Ihrer Immobilie herv… |
| de | `prop.marketing.seo_h3` | Sí | SEO mit hoher Intention | SEO mit hoher Suchintention |
| de | `prop.marketing.seo_kw2` | No | Costa del Sol Vermietung | Vermietung Costa del Sol |
| de | `prop.trust.body` | Sí | Vollständige Ruhe. Wir automatisieren die Verwaltung des re… | Rundum sorgenfrei. Wir automatisieren die Verwaltung des fü… |
| de | `prop.trust.items.access.b` | Sí | Digitale Registrierung und Fernwiderruf von Zugängen. | Digitale Zugangsprotokollierung und Fernwiderruf von Zugang… |
| de | `prop.trust.items.trace.b` | Sí | Unveränderliches Protokoll jeder Aktion und Anfrage. | Unveränderliches Protokoll aller Aktionen und Vorfälle. |
| de | `prop.trust.items.docs.b` | No | Digitale Signatur von Verträgen und Hausordnung. | Digitale Unterzeichnung von Verträgen und Hausordnung. |
| de | `prop.arch.eyebrow` | No | — SEDA OS Architektur | — SEDA-OS-Architektur |
| de | `prop.arch.mod.reservas.label` | No | Buchungsmaschine | Buchungs-Engine |
| de | `prop.arch.mod.reservas.body` | No | Eigene Multi-Channel-Engine mit Echtzeit-Synchronisation, A… | Eigene Multi-Channel-Engine mit Echtzeit-Synchronisation, Ü… |
| de | `prop.arch.mod.operacion.body` | Sí | Reinigung, Wartung, Gartenpflege und Zuweisung lokaler Team… | Einsatzplanung für Reinigung, Wartung und Gartenpflege sowi… |
| de | `prop.sim.occupancy_tick_low` | No | Konservativ (20%) | Konservativ (20 %) |
| de | `prop.sim.occupancy_tick_high` | No | Optimal (95%) | Optimal (95 %) |
| de | `prop.sim.projection` | No | SEDA OS Projektion | SEDA-OS-Projektion |
| de | `prop.sim.gross` | Sí | Bruttoerlös Jahr | Jährlicher Bruttoerlös |
| de | `prop.sim.net` | No | Netto an Eigentümer (OTA – Direkt) | Netto für den Eigentümer (OTA – direkt) |
| de | `prop.sim.disclaimer` | No | ⓘ Schätzung, die ausschließlich auf der von Ihnen eingegebe… | ⓘ Schätzung, die ausschließlich auf der von Ihnen eingegebe… |
| de | `prop.sim.net_note` | No | Die 24% gelten nur für den Unterkunftserlös: Wir ziehen zue… | Die 24 % gelten nur für den Unterkunftserlös: Wir ziehen zu… |
| de | `prop.faq.items.q1.a` | No | Wir erheben eine Provision von 24% auf den Unterkunftserlös… | Wir erheben eine Provision von 24 % auf den Unterkunftserlö… |
| de | `prop.faq.items.q2.a` | Sí | Ein SEDA-Team, lokal an der Costa del Sol angestellt, 24/7 … | Ein fest angestelltes SEDA-Team vor Ort an der Costa del So… |
| de | `prop.faq.items.q4.a` | Sí | Nein. Der gesamte Prozess (Bewertung, Vertrag, Onboarding, … | Nein. Der gesamte Prozess (Bewertung, Vertrag, Onboarding, … |
| de | `prop.faq.items.q5.a` | Sí | Ja. Blockieren Sie die Daten in SEDA OS oder im Eigentümerp… | Ja. Blockieren Sie die gewünschten Termine in SEDA OS oder … |
| de | `prop.faq.items.q7.a` | No | Sechzig Tage Kündigungsfrist, ohne Strafen. Bestätigte Buch… | 60 Tage Kündigungsfrist, ohne Vertragsstrafen. Bestätigte B… |
