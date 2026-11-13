"use strict";

/* =========================================================
   COACH DICH LEICHT – SCRIPT.JS
   Navigation, carousel, forms and GSAP animations
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initHomeLinks();
  initCarousel();
  initCustomFreebieForms();
  initInteractiveFaq();
  setCurrentYear();
  initGsapSafely();
});

/* ---------------------------
   Mobile navigation
   --------------------------- */
function initMobileNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".primary-navigation");

  if (!toggle || !navigation) return;

  const closeMenu = () => {
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Menü öffnen");
    navigation.classList.remove("is-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Menü öffnen" : "Menü schließen");
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 992px)").matches) closeMenu();
  });
}

/* ---------------------------
   Startseite links
   Other anchors scroll natively (CSS scroll-behavior), which also moves
   focus for the skip link and respects reduced motion.
   --------------------------- */
function initHomeLinks() {
  document.querySelectorAll('a[href="#startseite"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, left: 0, behavior: reduceMotion ? "auto" : "smooth" });
      history.replaceState(null, "", window.location.pathname + window.location.search);
    });
  });
}

/* ---------------------------
   Testimonials carousel
   --------------------------- */
function initCarousel() {
  const track = document.querySelector(".testimonials-track");
  const previousButton = document.querySelector(".carousel-button--prev");
  const nextButton = document.querySelector(".carousel-button--next");

  if (!track) return;

  const getScrollAmount = () => {
    const card = track.querySelector(".testimonial-card");
    if (!card) return 320;

    const styles = window.getComputedStyle(track);
    const gap = Number.parseFloat(styles.columnGap || styles.gap) || 24;
    return card.getBoundingClientRect().width + gap;
  };

  const scrollByCards = (direction) => {
    track.scrollBy({ left: direction * getScrollAmount(), behavior: "smooth" });
  };

  const updateButtons = () => {
    const maxScroll = track.scrollWidth - track.clientWidth - 2;
    if (previousButton) previousButton.disabled = track.scrollLeft <= 2;
    if (nextButton) nextButton.disabled = track.scrollLeft >= maxScroll;
  };

  previousButton?.addEventListener("click", () => scrollByCards(-1));
  nextButton?.addEventListener("click", () => scrollByCards(1));

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      scrollByCards(-1);
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      scrollByCards(1);
    }
  });

  track.addEventListener("scroll", updateButtons, { passive: true });
  window.addEventListener("resize", updateButtons);
  updateButtons();
}

/* ---------------------------
   Custom MailerLite freebie forms
   --------------------------- */
function initCustomFreebieForms() {
  document.querySelectorAll("[data-mailerlite-custom-form]").forEach((form) => {
    const submitButton = form.querySelector(".custom-freebie-submit");
    const status = form.querySelector(".custom-form-status");
    const email = form.querySelector('input[type="email"]');
    const targetName = form.getAttribute("target");
    const targetFrame = document.querySelector(`iframe[name="${targetName}"]`);
    let submitted = false;

    form.addEventListener("submit", (event) => {
      form.querySelectorAll(".custom-field-error").forEach((item) => {
        item.textContent = "";
      });
      form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
        field.removeAttribute("aria-invalid");
      });
      status.className = "custom-form-status";
      status.textContent = "";

      if (!form.checkValidity()) {
        event.preventDefault();
        const invalid = form.querySelector(":invalid");
        invalid?.setAttribute("aria-invalid", "true");
        const error = invalid?.closest(".custom-form-field")?.querySelector(".custom-field-error");
        if (error) {
          error.textContent = invalid?.validity.typeMismatch
            ? "Bitte gib eine gültige E-Mail-Adresse ein."
            : "Bitte fülle dieses Pflichtfeld aus.";
        }
        invalid?.focus();
        return;
      }

      submitted = true;
      submitButton?.classList.add("is-loading");
      submitButton?.setAttribute("aria-busy", "true");
      if (email) email.value = email.value.trim();
    });

    targetFrame?.addEventListener("load", () => {
      if (!submitted) return;
      submitted = false;
      submitButton?.classList.remove("is-loading");
      submitButton?.removeAttribute("aria-busy");
      status.className = "custom-form-status is-success";
      status.textContent = form.dataset.successMessage || "Danke! Bitte prüfe jetzt dein E-Mail-Postfach.";
      form.reset();
    });
  });
}

function initInteractiveFaq(){const quiz=document.querySelector("[data-faq-quiz]");if(!quiz)return;const slides=[...quiz.querySelectorAll("[data-quiz-slide]")],result=quiz.querySelector("[data-quiz-result]"),resultText=quiz.querySelector("[data-result-text]"),bar=quiz.querySelector("[data-progress-bar]"),answers=new Array(slides.length).fill(null);let step=0;const show=panel=>{[...slides,result].forEach(x=>x.hidden=x!==panel);if(window.gsap&&!matchMedia("(prefers-reduced-motion: reduce)").matches)gsap.fromTo(panel,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.65,ease:"sine.out",clearProps:"transform,opacity,visibility"});};const progress=n=>bar.style.width=`${n/slides.length*100}%`;slides.forEach((slide,i)=>{const choices=[...slide.querySelectorAll("[data-answer]")],box=slide.querySelector("[data-quiz-response]"),yes=slide.querySelector(".faq-response-yes"),no=slide.querySelector(".faq-response-no"),next=slide.querySelector("[data-quiz-next]");choices.forEach(btn=>btn.addEventListener("click",()=>{answers[i]=btn.dataset.answer;choices.forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));yes.hidden=btn.dataset.answer!=="yes";no.hidden=btn.dataset.answer!=="no";box.hidden=false;next.hidden=false;progress(i+1);}));next.addEventListener("click",()=>{if(!answers[i])return;if(i===slides.length-1){const n=answers.filter(x=>x==="yes").length;resultText.textContent=n>=6?`Du hast ${n} Fragen mit Ja beantwortet. Eine persönliche Begleitung könnte sehr gut zu deiner aktuellen Situation passen.`:n>=3?`Du hast ${n} Fragen mit Ja beantwortet. Reset28 oder ein Kennenlerngespräch können dir helfen, den passenden nächsten Schritt zu finden.`:`Du hast ${n} Fragen mit Ja beantwortet. Auch wenn aktuell nur wenige Punkte zutreffen, kannst du deine Fragen unverbindlich im Kennenlerngespräch klären.`;show(result);}else{step=i+1;show(slides[step]);}});});quiz.querySelector("[data-quiz-restart]").addEventListener("click",()=>{answers.fill(null);slides.forEach(slide=>{slide.querySelectorAll("[data-answer]").forEach(b=>b.setAttribute("aria-pressed","false"));slide.querySelector("[data-quiz-response]").hidden=true;slide.querySelector("[data-quiz-next]").hidden=true;});progress(0);show(slides[0]);});progress(0);show(slides[0]);}
/* ---------------------------
   Footer year
   --------------------------- */
function setCurrentYear() {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
}

function showAllContent() {
  document.documentElement.classList.remove("anim-pending");
}

/* ---------------------------
   GSAP safety wrapper
   Content remains visible if GSAP fails to load.
   --------------------------- */
function initGsapSafely() {
  const gsapAvailable = typeof window.gsap !== "undefined";
  const scrollTriggerAvailable = typeof window.ScrollTrigger !== "undefined";

  if (!gsapAvailable || !scrollTriggerAvailable) {
    console.warn("GSAP oder ScrollTrigger konnte nicht geladen werden. Alle Inhalte bleiben sichtbar.");
    showAllContent();
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    showAllContent();
    return;
  }

  // Removing the class and creating the tweens happen in the same task,
  // so the browser never paints the elements before GSAP hides them.
  showAllContent();
  initHeroAnimation();
  initSectionCloudAnimations();
  initScrollAnimations();

  window.addEventListener("load", () => {
    window.ScrollTrigger.refresh();
  });
}

/* ---------------------------
   Motion settings
   One shared feel for every fly-in: quick start, long soft landing
   ("power3.out"), and distances big enough that the element never crawls
   pixel by pixel at the end (that crawl is what reads as jitter).
   --------------------------- */
const MOTION = {
  ease: "power3.out",
  duration: 1,
  stagger: 0.12
};

/* ---------------------------
   Hero intro
   --------------------------- */
function initHeroAnimation() {
  const gsap = window.gsap;
  const isSmall = window.matchMedia("(max-width: 767px)").matches;
  const heroTimeline = gsap.timeline({
    defaults: { ease: MOTION.ease }
  });

  heroTimeline
    .from(".hero-cloud-left", { xPercent: -80, autoAlpha: 0, duration: 1.6, clearProps: "transform,opacity,visibility" }, 0)
    .from(".hero-cloud-right", { xPercent: 80, autoAlpha: 0, duration: 1.6, clearProps: "transform,opacity,visibility" }, 0)
    // The logo only moves (no fade), so it is visible – and measurable as LCP – right away.
    .from(".hero-logo", { y: isSmall ? 24 : 36, duration: 1.2, clearProps: "transform" }, 0)
    .from(".hero-text", { y: isSmall ? 28 : 40, autoAlpha: 0, duration: MOTION.duration, clearProps: "transform,opacity,visibility" }, 0.25)
    .from(".hero-buttons", { y: isSmall ? 20 : 28, autoAlpha: 0, duration: MOTION.duration, clearProps: "transform,opacity,visibility" }, 0.45);
}

/* ---------------------------
   Decorative section clouds
   --------------------------- */
function initSectionCloudAnimations() {
  window.gsap.utils.toArray("section[id]").forEach((section) => {
    const clouds = [section.querySelector(".section-cloud-left"), section.querySelector(".section-cloud-right")].filter(Boolean);
    if (!clouds.length) return;

    window.gsap.from(clouds, {
      autoAlpha: 0,
      x: (index) => index === 0 ? -60 : 60,
      duration: 1.6,
      stagger: 0.1,
      ease: "power2.out",
      clearProps: "transform,opacity,visibility",
      scrollTrigger: {
        trigger: section,
        start: "top 85%",
        once: true
      }
    });
  });
}

/* ---------------------------
   Scroll fly-ins
   Elements that enter the viewport together are animated as one batch
   with a short stagger, so neighbours arrive in a smooth wave instead of
   each starting on its own trigger.
   --------------------------- */
function initScrollAnimations() {
  const gsap = window.gsap;
  const isSmall = window.matchMedia("(max-width: 767px)").matches;
  const distance = isSmall ? 28 : 44;
  const groups = [
    { selector: ".fade-up", from: { y: distance } },
    { selector: ".slide-left", from: { x: -distance * 1.4 } },
    { selector: ".slide-right", from: { x: distance * 1.4 } }
  ];

  document.documentElement.classList.add("gsap-active");

  // An anchor target that is still offset for its fly-in would be scrolled to
  // its shifted position. Drop the offset on click so the jump lands exactly;
  // the element then only fades in.
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (target && !target.classList.contains("is-revealed")) gsap.set(target, { x: 0, y: 0 });
    });
  });

  groups.forEach(({ selector, from }) => {
    const elements = gsap.utils.toArray(selector);
    if (!elements.length) return;

    gsap.set(elements, { ...from, autoAlpha: 0 });

    window.ScrollTrigger.batch(elements, {
      start: "top 88%",
      once: true,
      onEnter: (batch) => gsap.to(batch, {
        x: 0,
        y: 0,
        autoAlpha: 1,
        duration: MOTION.duration,
        ease: MOTION.ease,
        stagger: MOTION.stagger,
        overwrite: true,
        clearProps: "transform,opacity,visibility",
        onComplete: () => batch.forEach((element) => element.classList.add("is-revealed"))
      })
    });
  });
}
