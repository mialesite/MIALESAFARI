# Facts still needed from Miale

Nothing in this list has been invented. Each entry is either a field the site cannot fill
itself, or a number that is currently a placeholder in the code and must be replaced with the
real value before it is shown to a customer.

## Business and legal identity

- [ ] Registered company name exactly as it appears on the certificate of registration
- [ ] Business / TRA licence number
- [ ] TATO (Tanzania Association of Tour Operators) membership number, and whether to name it
- [ ] TTB (Tanzania Tourist Board) licence number
- [ ] Year the business started operating (the "15+ years / 500+ private journeys" band on the
      homepage has been deleted; supply the real numbers and it can come back)
- [ ] Physical office wording: currently "Sombetini JR, Arusha" in the contact section and map pin
- [ ] Which email aliases are real and monitored (`info@mialesafari.com` is used everywhere;
      `reservations@` / `accounts@` are not asserted anywhere yet)
- [ ] Confirm both phone lines: `+255 769 333 331` and `+44 7769 202031`, and which one is WhatsApp

## Prices

No price shows anywhere on the public site until the desk enters one. What the 2026-11-22 pass
removed, and what replaced it:

- [ ] The 11 "from" prices in `src/lib/tours.ts` ($480 to $6,500) were invented and are deleted.
      Cards and detail pages now read **"Priced to order"** through `priceLabel()` in that file; a
      number reappears as soon as `priceFrom` or `priceUSD` is filled in Admin → Expeditions.
- [ ] Itineraries already synced to Firestore from the old static list still carry those invented
      `priceFrom` values, so those rows will display a price. Clear the field on each row, or re-sync
      once the figures are real.
- [ ] The booking dialog quoted **$500 per person per day** as "Guide Value: From $X" and wrote
      `estimatedPrice` into every `bookings` document. Both are gone: the step now reads
      "N travellers · D days" and stores `tripDays`. The enquiry email prints the visitor's own
      target budget, or "Not stated".
- [ ] Kilimanjaro climb prices per route and per date, if routes go live
- [ ] Single-supplement, park fees, and whether domestic flights are quoted inclusive
- [ ] Currency policy: the switcher offers TZS and USD; which one is the booking currency

## Destination rows in Firestore

- [ ] The `destinations` collection holds duplicate documents (Lake Manyara ×4, Serengeti ×3,
      Nyerere ×3, Tarangire ×2, Ngorongoro ×2, Mahale ×3). Root cause: the import button exists on
      three admin surfaces (Parks page, Destinations page, homepage Explorer) and each sync only
      checked "does a doc with this exact name exist" at the moment it ran, so repeats wrote copies.
      Every public listing now dedupes by name in code, so visitors see one row each, but the
      duplicate Firestore documents remain and should be deleted in Admin → Destinations (a
      production write, needing the owner's go-ahead).
- [ ] Several live destination rows carry puffery the desk did not write, e.g. Tarangire
      "The Land of Giants: Ancient Baobabs and massive elephant herds" and a Mahale claim of being
      "the world's premier destination for Chimpanzee trekking". These came in with the synced rows
      and can only be corrected by editing the Firestore documents.

## Itinerary content

- [ ] Real tour names, durations and route steps for each package the site sells
- [ ] What is actually included and excluded per package
- [ ] Group departures, if any (the site does not currently claim any)

## People

- [ ] Founder / lead guide names and the credentials that may be published
- [ ] Photographer credits for the operator archive images, if any are owed
- [ ] Named, verifiable reviews with the platform they came from (Google, TripAdvisor) and permission
      to reproduce them

## Fleet and transfers

- [ ] Vehicle count, make/model, year, roof type, and whether 4x4 may be claimed for every vehicle
- [ ] Which transfers are self-driven versus air charter
- [ ] Driver-guide ratio and any stated safety standard

## Accommodation and partners

- [ ] Camp and lodge partners that may be named, and the tier each belongs to
- [ ] Whether "luxury", "exclusive use" or "private guide" may be claimed as a standard

## Image library

- [ ] Written permission covering the 75 operator-archive frames now served from `public/images`
      (see `LICENSES.md`, section "Missing provenance")
- [ ] Original-resolution exports for the frames that are capped at 1024px wide, so full-bleed
      heroes are not upscaled
- [ ] A square version of the brand mark for the app icon and favicon (current icon is the
      wordmark cropped)
- [ ] Model releases for the 9 people frames that were excluded from the library
- [ ] Hero dimming: the live Firestore slides store "Overlay Dimming" 0.6, which the public hero
      renders as `brightness(0.4)` and crushes the photograph. Lower it in Admin → Hero (values
      around 0.25–0.35 keep the headline legible) rather than editing the formula, because the
      stored number is operator content I have not written to

## About page (`/about`) — sign-off

The page is live and contains only facts already verifiable from this repository: the Arusha base,
the two published lines, `info@mialesafari.com`, the tagline, and the enquiry-led flow the site
actually implements. Three sentences go slightly beyond that and need the owner's yes or no.

- [ ] Coverage list: the page names the parks the desk plans across (Serengeti, Ngorongoro,
      Tarangire, Lake Manyara, Nyerere, Ruaha, Mikumi, Gombe, Mahale, Kilimanjaro, Meru, Zanzibar,
      Mafia). Confirm which of these Miale genuinely runs and cut the rest.
- [ ] "You get a name and a number before you fly" and "the person who plans the route is the
      person who answers when the weather changes" — true only if one planner owns an enquiry
      start to finish. Reword if the desk rotates.
- [ ] "Nothing is charged and nothing is confirmed until the plan has been agreed" — `/terms`
      section 2 confirms a booking only on a deposit plus an expedition voucher. Check that ordering
      against how bookings are actually taken.

Sections the two reference About pages carry, blocked on the lists above rather than on code:
founding year and ownership in the hero eyebrow and facts band, a "Meet the guides" block with
photographs (the 9 people frames are still excluded from the library), camp and lodge partners,
licence/TATO/TTB numbers, and a reviews strip. Supplying any one of them unlocks that block.

Separately, `/terms` and `/privacy` referred to the company as **Mushaz Safari**. That name is gone
from every page, but the registered legal name is still needed before the two documents are
reviewed and dated.

## Decisions still open

- [ ] Whether to build the travel-information hub, journal and migration-calendar pages that
      visittanzania.africa runs, in the same pass as the content rebuild
- [ ] Whether to keep the 3-language plan, and if so which languages
- [ ] Newsletter capture: the live site footer is now `src/components/SiteFooter.tsx`, rendered from
      the root layout on every public page, and it has no email form. The old
      `src/components/Footer.tsx` still exists but nothing imports it; its handler works (writes the
      Firestore `newsletter` collection that `/admin/marketing` reads), but its Facebook and
      YouTube links point at `#`. Decide whether to port the capture into the live footer and
      whether the two dead socials have real handles, then delete the orphan

## Claims deleted in the 2026-11-22 polish pass

Each of these was an unverifiable statement or template filler in customer-facing copy. All of them
can come back the moment the real fact exists.

- [ ] Homepage band "15+ years / 500+ private journeys" now reads Arusha / Tanzania / On paper.
- [ ] Homepage trust band claimed an "Exclusive 4x4 fleet", "seamless bush flight transfers" and
      "Elite naturalists born and raised in the heart of Tanzania". Replaced with what the site
      actually does. The fleet list and guide credentials unlock the originals.
- [ ] Booking confirmation promised the itinerary "within 24 hours". No response-time promise is
      made anywhere now; confirm the turnaround the desk can keep and put it back deliberately.
- [ ] "We don't just book safaris; we engineer lifelong memories" and "The benchmark for luxury
      Tanzanian travel ... unparalleled wildlife encounters" rewritten.
- [ ] Destinations hero ("legendary landscapes ... spice-scented alleys ... the heart of the wild"),
      contact headline "Let's Craft Your Journey", "Elite Consultation" and "Bespoke Protection"
      rewritten in the desk's voice.

## Questions this pass raised

- [ ] Canonical domain: the SEO shell, app icons, `opengraph-image.jpg`, `sitemap.ts` and `robots.ts`
      all now publish `https://mialesafari.com`. The admin rules in `firestore.rules` also accept
      `@mialesafaris.com` (plural). Confirm which host the site is served from.
- [ ] Firestore `hero_slides` still stores a title and subtitle per slide, but the public hero now
      ignores them and shows the fixed lockup ("Tanzania, planned from Arusha."); only the slide
      name prints, as the small caption. Either trim those two fields from Admin → Hero or say so
      and the hero can read them again.
- [ ] `firestore.rules` declares the `itineraries` and `destinations` paths twice, and a later
      `match` block replaces an earlier one, so the public read is overridden by the admin block.
      Needs one merged rule deployed, not two sections.
- [ ] `/api/upload` is reachable and no page calls it.
- [ ] There is no branded 404: `/_not-found` is still the default Next page.
- [ ] `+44 7769 202031` is published as a second line in the footer, the contact section and the
      About page. Confirm it belongs to Miale; if it is a template leftover, cut all three.
