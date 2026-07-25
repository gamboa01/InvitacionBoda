(() => {
  "use strict";

  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance
    const hero = document.querySelector("header.hero");
    if (hero) {
      const heroLeft = hero.querySelector(".hero-inner > div:first-child");
      const heroRight = hero.querySelector(".goalcard");
      gsap.from(hero, { opacity: 0, y: 28, duration: 0.9, ease: "power3.out" });
      if (heroLeft) {
        gsap.from(heroLeft.children, {
          opacity: 0,
          y: 34,
          filter: "blur(10px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          delay: 0.1
        });
      }
      if (heroRight) {
        gsap.from(heroRight, {
          opacity: 0,
          y: 34,
          filter: "blur(10px)",
          duration: 1.0,
          ease: "power3.out",
          delay: 0.2
        });
      }
    }

    // Sections reveal on scroll
    const sections = gsap.utils.toArray("section");
    sections.forEach((sec) => {
      const items = sec.querySelectorAll(".card, .item, .notice, .timeline-item");
      gsap.from(sec, {
        opacity: 0,
        y: 34,
        duration: 0.955,
        ease: "power3.out",
        scrollTrigger: {
          trigger: sec,
          start: "top 86%"
        }
      });
      if (items.length) {
        gsap.from(items, {
          opacity: 0,
          y: 22,
          filter: "blur(10px)",
          duration: 0.95,
          ease: "power3.out",
          stagger: 0.06,
          scrollTrigger: {
            trigger: sec,
            start: "top 86%"
          }
        });
      }
    });

    // Glow pulse (meta de ahorro)
    const goal = document.querySelector(".goal-amount");
    if (goal) {
      gsap.to(goal, {
        textShadow: "0 14px 34px rgba(184,138,43,.35)",
        duration: 1.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    }

    // Buttons micro-interaction
    const buttons = gsap.utils.toArray(".btn");
    buttons.forEach((b) => {
      b.addEventListener("mouseenter", () => {
        gsap.to(b, { scale: 1.02, duration: 0.18, ease: "power2.out" });
      });
      b.addEventListener("mouseleave", () => {
        gsap.to(b, { scale: 1.0, duration: 0.18, ease: "power2.out" });
      });
    });
  }
})();
