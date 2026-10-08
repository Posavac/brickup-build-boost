import { useEffect, useRef } from "react";

/**
 * Postavlja data-reveal="shown" kad element uđe u vidno polje.
 * Jedan IntersectionObserver za cijelu stranicu umjesto po-elementnih
 * scroll listenera, pa je jeftin i na slabijim mobitelima.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.dataset.reveal = "shown";
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
