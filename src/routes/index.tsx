import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  PaintBucket,
  Brush,
  Zap,
  Wrench,
  CheckCircle2,
  Phone,
  Mail,
  MapPin,
  Users,
  ClipboardCheck,
  Building2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import {
  absoluteUrl,
  allCities,
  business,
  faq,
  navLinks,
  processSteps,
  seo,
  serviceAreas,
  services,
  siteUrl,
} from "@/lib/site";
import { homePageJsonLd } from "@/lib/structured-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: seo.title },
      { name: "description", content: seo.description },
      // Ključne riječi kao meta oznaka Google ignorira od 2009., ali ih neki
      // manji tražilice i AI alati i dalje čitaju — jeftino je ostaviti.
      {
        name: "keywords",
        content: [
          "električar Zagreb",
          "električar Slavonija",
          "elektroinstalacije Zagreb",
          "gletanje Zagreb",
          "soboslikarstvo Zagreb",
          "kućni majstor Zagreb",
          "majstor Osijek",
          "adaptacija stana",
        ].join(", "),
      },
      { property: "og:title", content: seo.title },
      { property: "og:description", content: seo.description },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: absoluteUrl(seo.ogImage) },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content: "Majstor BrickUpa tijekom radova na stanu",
      },
      { name: "twitter:title", content: seo.title },
      { name: "twitter:description", content: seo.description },
      { name: "twitter:image", content: absoluteUrl(seo.ogImage) },
      // TanStack pretvara ovo u <script type="application/ld+json"> u <head>.
      { "script:ld+json": homePageJsonLd },
    ],
    links: [
      { rel: "canonical", href: siteUrl },
      // Prva slika galerije je ujedno najveći element na ekranu kod scrolla —
      // preload joj skraćuje vrijeme prikaza.
      { rel: "preload", as: "image", href: "/images/struja/struja-1-thumb.webp" },
    ],
  }),
  component: Index,
});

/** Ikone se drže odvojeno od podataka u site.ts da konfiguracija ostane čisti tekst. */
const serviceIcons: Record<string, LucideIcon> = {
  elektroinstalacije: Zap,
  gletanje: PaintBucket,
  soboslikarstvo: Brush,
  "kucni-majstor": Wrench,
};

const reasons = [
  {
    icon: Users,
    title: "Tim, ne pojedinac",
    desc: "Više majstora i jedan dogovor — posao ide brže nego kad sami slažete raspored nekoliko obrtnika.",
  },
  {
    icon: MapPin,
    title: "Pokrivamo dvije regije",
    desc: "Zagreb s okolicom i cijela Slavonija. Dolazak dogovaramo odmah, bez čekanja tjednima.",
  },
  {
    icon: Building2,
    title: "Stan ili poslovni prostor",
    desc: "Od jedne utičnice i sobe do kompletne adaptacije stana ili uređenja poslovnog prostora.",
  },
  {
    icon: ClipboardCheck,
    title: "Jasna ponuda unaprijed",
    desc: "Iznos po stavkama prije početka radova. Bez skrivenih troškova i iznenađenja na kraju.",
  },
];

function Logo({ className = "" }: { className?: string }) {
  return (
    <div
      className={`inline-flex items-baseline gap-0.5 font-display font-extrabold tracking-tight ${className}`}
    >
      <span>BrickU</span>
      <span className="relative">
        p
        <ArrowUpRight className="absolute -top-3 -right-3 text-brand" strokeWidth={3} size={16} />
      </span>
    </div>
  );
}

function Index() {
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [lightbox, setLightbox] = useState<{ src: string; alt: string } | null>(null);

  // Escape zatvara galeriju — bez toga se na tipkovnici iz nje nije moglo izaći.
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      ime: String(data.get("ime") ?? ""),
      telefon: String(data.get("telefon") ?? ""),
      email: String(data.get("email") ?? ""),
      grad: String(data.get("grad") ?? ""),
      vrsta: String(data.get("vrsta") ?? ""),
      opis: String(data.get("opis") ?? ""),
      website: String(data.get("website") ?? ""),
    };
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await res.json().catch(() => null);
      if (!res.ok || !result?.ok) {
        const message = result?.error || "Slanje nije uspjelo. Pokušajte ponovno ili nas nazovite.";
        setFormError(message);
        toast.error("Greška", { description: message });
        return;
      }
      toast.success("Upit poslan", { description: "Hvala! Javljamo se u najkraćem mogućem roku." });
      form.reset();
    } catch {
      const message =
        "Nismo se mogli spojiti na server. Pokušajte ponovno ili nas nazovite telefonom.";
      setFormError(message);
      toast.error("Greška", { description: message });
    } finally {
      setSubmitting(false);
    }
  };

  const activeService = services[activeTab];
  const galleryImages = Array.from({ length: activeService.imageCount }, (_, i) => ({
    thumb: `/images/${activeService.folder}/${activeService.folder}-${i + 1}-thumb.webp`,
    full: `/images/${activeService.folder}/${activeService.folder}-${i + 1}.webp`,
    alt: `${activeService.title} — primjer izvedenog rada ${i + 1}, BrickUp Zagreb i Slavonija`,
  }));

  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <Toaster richColors position="top-center" />

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
          onClick={() => setLightbox(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Uvećani prikaz slike"
        >
          <button
            className="absolute top-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            onClick={() => setLightbox(null)}
            aria-label="Zatvori sliku"
          >
            <X size={20} />
          </button>
          <img
            src={lightbox.src}
            alt={lightbox.alt}
            className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* NAV */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <a
            href="#top"
            className="text-xl text-foreground"
            aria-label="BrickUp — početak stranice"
          >
            <Logo />
          </a>
          <nav
            className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex"
            aria-label="Glavna navigacija"
          >
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="hover:text-foreground">
                {link.label}
              </a>
            ))}
          </nav>
          {/* Na mobitelu nema navigacije (premalo mjesta za šest poveznica),
              pa poziv na akciju mora ostati vidljiv — to je jedini gumb u
              zaglavlju na malom ekranu. */}
          <a
            href="#kontakt"
            className="inline-flex shrink-0 rounded-md bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:brightness-95 sm:px-4 sm:text-sm"
          >
            Besplatna ponuda
          </a>
        </div>
      </header>

      <main>
        {/* HERO */}
        <section
          id="top"
          className="relative overflow-hidden bg-secondary text-secondary-foreground"
        >
          <div
            className="absolute inset-0 opacity-[0.08]"
            style={{
              backgroundImage:
                "linear-gradient(var(--color-brand) 1px, transparent 1px), linear-gradient(90deg, var(--color-brand) 1px, transparent 1px)",
              backgroundSize: "44px 44px",
            }}
            aria-hidden
          />
          <div
            className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl"
            aria-hidden
          />
          <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-20 md:pt-28 md:pb-28">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium tracking-wider text-white/70 uppercase">
                <span className="h-1.5 w-1.5 rounded-full bg-brand" /> Zagreb &amp; Slavonija
              </p>
              {/* Jedan H1 na stranici, s glavnim pojmom i lokacijom — to je
                  najjači signal tražilici o čemu je stranica. */}
              <h1 className="mt-5 font-display text-4xl leading-[1.05] font-extrabold tracking-tight sm:text-5xl md:text-6xl">
                Električarski radovi i završni obrti{" "}
                <span className="text-brand">za Zagreb i Slavoniju</span>
              </h1>
              <p className="mt-5 font-display text-xl font-bold tracking-tight text-white/90">
                {business.tagline}
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
                Kompletne elektroinstalacije, adaptacije, rasvjeta i zamjena osigurača, gletanje,
                soboslikarstvo i usluge kućnog majstora — sve od jednog tima. Besplatna ponuda,
                odgovor na upit unutar 24 sata.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <a
                  href="#kontakt"
                  className="group inline-flex items-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground shadow-lg shadow-black/20 transition hover:brightness-95"
                >
                  Zatraži besplatnu ponudu
                  <ArrowUpRight
                    size={18}
                    className="transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </a>
                <a
                  href={`tel:${business.phoneE164}`}
                  className="inline-flex items-center gap-2 rounded-md border border-white/15 px-5 py-3.5 text-sm font-semibold text-white hover:bg-white/5"
                >
                  <Phone size={16} /> {business.phoneDisplay}
                </a>
              </div>
            </div>
            <ul className="mt-14 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {services.map((service) => {
                const Icon = serviceIcons[service.id];
                return (
                  <li
                    key={service.id}
                    className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur"
                  >
                    <span
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
                      style={{ background: service.accentBg }}
                    >
                      <Icon size={16} style={{ color: service.accentFg }} strokeWidth={2.2} />
                    </span>
                    <span className="text-sm font-medium text-white/85">{service.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        {/* USLUGE */}
        <section id="usluge" className="mx-auto max-w-6xl px-5 py-20 md:py-28">
          <div className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">Usluge</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Što radimo
              </h2>
            </div>
            <p className="max-w-md text-muted-foreground">
              Četiri područja, jedan tim. Sve radove pokrivamo sami, bez podizvođača koji nestanu na
              pola posla.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = serviceIcons[service.id];
              return (
                <article
                  key={service.id}
                  id={`usluga-${service.id}`}
                  className="group relative overflow-hidden rounded-xl border border-border bg-card p-7 transition hover:border-brand hover:shadow-lg"
                >
                  <div
                    className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full transition"
                    style={{ background: service.accentBg }}
                  >
                    <Icon size={22} style={{ color: service.accentFg }} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-display text-xl font-bold tracking-tight">{service.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {service.short}
                  </p>
                  {/* Konkretni zahvati, a ne općeniti opis: po ovim pojmovima
                      ljudi zapravo pretražuju ("zamjena osigurača", "bandažiranje"). */}
                  <ul className="mt-5 space-y-2">
                    {service.items.map((item) => (
                      <li
                        key={item}
                        className="flex gap-2.5 text-sm leading-relaxed text-foreground"
                      >
                        <CheckCircle2
                          size={16}
                          className="mt-0.5 shrink-0 text-brand"
                          strokeWidth={2.5}
                          aria-hidden
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-10 max-w-3xl rounded-lg border border-dashed border-border bg-muted/40 p-5 text-center text-sm text-foreground sm:text-base">
            Radimo u timu, što znači brže izvođenje i manje stresa za vas — bez čekanja na nekoliko
            majstora redom. Vaše vrijeme i živci previše su vrijedni da bi se trošili na
            usklađivanje obrtnika; taj dio preuzimamo mi.
          </p>
        </section>

        {/* KAKO RADIMO */}
        <section id="kako-radimo" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">Kako radimo</p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Od upita do gotovog posla u četiri koraka
            </h2>
            <ol className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {processSteps.map((step, index) => (
                <li key={step.title} className="rounded-xl border border-border bg-card p-6">
                  <span className="font-display text-3xl font-extrabold text-brand">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-3 font-display text-lg font-bold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* GALERIJA */}
        <section id="galerija" className="py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">Galerija</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Naši radovi
            </h2>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Fotografije s izvedenih poslova. Odaberite uslugu i kliknite na sliku za veći prikaz.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {services.map((service, idx) => {
                const Icon = serviceIcons[service.id];
                const selected = activeTab === idx;
                return (
                  <button
                    key={service.id}
                    type="button"
                    aria-pressed={selected}
                    aria-controls="galerija-mreza"
                    onClick={() => setActiveTab(idx)}
                    className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition ${
                      selected
                        ? "bg-foreground text-background shadow"
                        : "border border-border bg-card text-muted-foreground hover:border-brand hover:text-foreground"
                    }`}
                  >
                    <span
                      className="flex h-6 w-6 items-center justify-center rounded-full"
                      style={{ background: service.accentBg }}
                    >
                      <Icon size={13} style={{ color: service.accentFg }} strokeWidth={2.5} />
                    </span>
                    {service.title}
                  </button>
                );
              })}
            </div>

            <div id="galerija-mreza" className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {galleryImages.map((image, i) => (
                <button
                  key={image.full}
                  type="button"
                  onClick={() => setLightbox({ src: image.full, alt: image.alt })}
                  className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted"
                  aria-label={`Otvori sliku: ${activeService.title} ${i + 1}`}
                >
                  <img
                    src={image.thumb}
                    alt={image.alt}
                    width={800}
                    height={600}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    loading={i < 3 ? "eager" : "lazy"}
                    decoding="async"
                  />
                  <span className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* PODRUČJA */}
        <section id="podrucja" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Područja rada
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Gdje sve dolazimo
            </h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              Pokrivamo dvije regije. Ako vaše mjesto nije na popisu, a u blizini je nekog od
              navedenih gradova — svejedno nazovite, najvjerojatnije dolazimo.
            </p>
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {serviceAreas.map((area) => (
                <div key={area.region} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="flex items-center gap-2 font-display text-lg font-bold tracking-tight">
                    <MapPin size={18} className="text-brand" strokeWidth={2.4} aria-hidden />
                    {area.region}
                  </h3>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {area.cities.map((city) => (
                      <li
                        key={city}
                        className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-foreground"
                      >
                        {city}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* O NAMA */}
        <section id="o-nama" className="py-20 md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 md:grid-cols-5 md:items-center">
            <div className="md:col-span-3">
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">O nama</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Tim kojem možete vjerovati
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                BrickUp je tim majstora koji pokriva Zagreb i Slavoniju. Radimo i za privatne osobe
                koje renoviraju svoj dom, i za tvrtke koje trebaju pouzdanog izvođača za veće
                projekte.
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                Naš pristup je jednostavan:{" "}
                <strong className="font-semibold text-foreground">
                  dogovoreno, na vrijeme, uredno
                </strong>{" "}
                — bez skrivenih troškova i bez priča. Prostor prije radova zaštitimo, a nakon
                završetka očistimo za sobom.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              {[
                { k: "2", l: "regije" },
                { k: "4", l: "usluge" },
                { k: "Tim", l: "ne pojedinac" },
                { k: "24 h", l: "odgovor na upit" },
              ].map((stat) => (
                <div key={stat.l} className="rounded-xl border border-border bg-card p-5">
                  <div className="font-display text-3xl font-extrabold text-brand sm:text-4xl">
                    {stat.k}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ZAŠTO */}
        <section id="zasto" className="bg-muted/40 py-20 md:py-28">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Zašto BrickUp
            </p>
            <h2 className="mt-2 max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Zašto ljudi biraju nas
            </h2>
            <div className="mt-12 grid gap-4 sm:grid-cols-2">
              {reasons.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-5 rounded-xl border border-border bg-card p-6">
                  <div className="relative shrink-0">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-secondary text-brand">
                      <Icon size={22} strokeWidth={2.2} aria-hidden />
                    </div>
                    <CheckCircle2
                      size={16}
                      className="absolute -right-1 -bottom-1 rounded-full bg-background text-brand"
                      strokeWidth={2.5}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold tracking-tight">{title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* PITANJA */}
        <section id="pitanja" className="py-20 md:py-28">
          <div className="mx-auto max-w-3xl px-5">
            <p className="text-sm font-semibold tracking-wider text-brand uppercase">
              Česta pitanja
            </p>
            <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Ono što nas najčešće pitaju
            </h2>
            {/* Native <details> namjerno umjesto JS akordeona: odgovori su u
                HTML-u i kad se skripta ne izvrši, pa ih tražilice i AI modeli
                pročitaju bez obzira na JavaScript. */}
            <div className="mt-10 divide-y divide-border rounded-xl border border-border bg-card">
              {faq.map((entry) => (
                <details
                  key={entry.q}
                  className="group px-6 py-5 [&_summary::-webkit-details-marker]:hidden"
                >
                  <summary className="flex cursor-pointer items-start justify-between gap-4">
                    <h3 className="font-display text-base font-bold tracking-tight sm:text-lg">
                      {entry.q}
                    </h3>
                    <span
                      className="mt-0.5 shrink-0 text-brand transition group-open:rotate-45"
                      aria-hidden
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      >
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </span>
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground sm:text-base">
                    {entry.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* KONTAKT */}
        <section id="kontakt" className="bg-secondary py-20 text-secondary-foreground md:py-28">
          <div className="mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <p className="text-sm font-semibold tracking-wider text-brand uppercase">Kontakt</p>
              <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
                Zatražite ponudu danas
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-white/75">
                Javite nam vrstu posla i lokaciju — javljamo se unutar 24 sata s konkretnom ponudom.
                Ponuda je besplatna i ni na što vas ne obvezuje.
              </p>
              <div className="mt-8 space-y-3">
                <a
                  href={`tel:${business.phoneE164}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <Phone size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-wider text-white/50 uppercase">
                      Telefon
                    </span>
                    <span className="block font-semibold">{business.phoneDisplay}</span>
                  </span>
                </a>
                <a
                  href={`mailto:${business.email}`}
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4 transition hover:border-brand"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-brand text-brand-foreground">
                    <Mail size={18} aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs tracking-wider text-white/50 uppercase">
                      Email
                    </span>
                    <span className="block truncate font-semibold">{business.email}</span>
                  </span>
                </a>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white p-6 text-foreground sm:p-8 lg:col-span-3"
            >
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  width: 1,
                  height: 1,
                  overflow: "hidden",
                }}
                aria-hidden="true"
              >
                <label htmlFor="website">Website</label>
                <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Ime i prezime" required>
                  <input
                    name="ime"
                    required
                    autoComplete="name"
                    className="form-input"
                    placeholder="Ivan Horvat"
                  />
                </Field>
                <Field label="Telefon" required>
                  <input
                    name="telefon"
                    required
                    type="tel"
                    autoComplete="tel"
                    className="form-input"
                    placeholder="091 234 5678"
                  />
                </Field>
                <Field label="Email" hint="opcionalno">
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    className="form-input"
                    placeholder="vas@email.com"
                  />
                </Field>
                <Field label="Grad" required>
                  <select name="grad" required className="form-input" defaultValue="">
                    <option value="" disabled>
                      Odaberite grad
                    </option>
                    {allCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="Ostalo">Ostalo</option>
                  </select>
                </Field>
                <Field label="Vrsta posla" required className="sm:col-span-2">
                  <select name="vrsta" required className="form-input" defaultValue="">
                    <option value="" disabled>
                      Odaberite vrstu posla
                    </option>
                    {services.map((service) => (
                      <option key={service.id} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                    <option value="Više usluga / adaptacija">Više usluga / adaptacija</option>
                    <option value="Ostalo">Ostalo</option>
                  </select>
                </Field>
                <Field label="Opis posla" required className="sm:col-span-2">
                  <textarea
                    name="opis"
                    required
                    rows={4}
                    className="form-input resize-none"
                    placeholder="Ukratko opišite što treba napraviti, kvadraturu i rok ako imate."
                  />
                </Field>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-bold text-brand-foreground transition hover:brightness-95 disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Šaljem..." : "Pošalji upit"}
                <ArrowUpRight size={18} aria-hidden />
              </button>
              {formError && <p className="mt-3 text-sm font-medium text-red-600">{formError}</p>}
            </form>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-5 py-10">
          <div className="grid gap-6 sm:grid-cols-3 sm:items-center">
            <div>
              <Logo className="text-lg" />
              <p className="mt-2 text-sm text-muted-foreground">
                {business.tagline} Zagreb &amp; Slavonija.
              </p>
            </div>
            <div className="space-y-1 text-sm text-muted-foreground sm:text-center">
              <div>
                Telefon:{" "}
                <a className="text-foreground hover:text-brand" href={`tel:${business.phoneE164}`}>
                  {business.phoneDisplay}
                </a>
              </div>
              <div>
                Email:{" "}
                <a className="text-foreground hover:text-brand" href={`mailto:${business.email}`}>
                  {business.email}
                </a>
              </div>
            </div>
            <p className="text-sm text-muted-foreground sm:text-right">
              © {new Date().getFullYear()} {business.name}. Sva prava pridržana.
            </p>
          </div>
          {/* Popis usluga i gradova u podnožju: dodatni tekstualni signal
              tražilici o opsegu posla i pokrivenosti. */}
          <p className="mt-8 border-t border-border pt-6 text-xs leading-relaxed text-muted-foreground">
            {business.name} izvodi{" "}
            {services
              .slice(0, -1)
              .map((s) => s.accusative)
              .join(", ")}{" "}
            i {services[services.length - 1].accusative} na području gradova: {allCities.join(", ")}{" "}
            i okolnih mjesta.
          </p>
        </div>
      </footer>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-brand">*</span>}
        {hint && <span className="text-xs font-normal text-muted-foreground">({hint})</span>}
      </span>
      {children}
    </label>
  );
}
