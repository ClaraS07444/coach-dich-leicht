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

    const setStatus = (type, message) => {
      status.className = type ? `custom-form-status is-${type}` : "custom-form-status";
      status.textContent = message;
    };

    const setLoading = (isLoading) => {
      submitButton?.classList.toggle("is-loading", isLoading);
      if (isLoading) submitButton?.setAttribute("aria-busy", "true");
      else submitButton?.removeAttribute("aria-busy");
    };

    const showFieldError = (field, message) => {
      field.setAttribute("aria-invalid", "true");
      const error = field.closest(".custom-form-field")?.querySelector(".custom-field-error");
      if (error) error.textContent = message;
      field.focus();
    };

    const succeed = () => {
      setLoading(false);
      setStatus("success", form.dataset.successMessage || "Danke! Bitte prüfe jetzt dein E-Mail-Postfach.");
      form.reset();
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      form.querySelectorAll(".custom-field-error").forEach((item) => { item.textContent = ""; });
      form.querySelectorAll('[aria-invalid="true"]').forEach((field) => field.removeAttribute("aria-invalid"));
      setStatus("", "");
      if (email) email.value = email.value.trim();

      if (!form.checkValidity()) {
        const invalid = form.querySelector(":invalid");
        showFieldError(invalid, invalid.validity.typeMismatch ? "Bitte gib eine gültige E-Mail-Adresse ein." : "Bitte fülle dieses Pflichtfeld aus.");
        return;
      }

      // Preview builds have no action: nothing is sent anywhere.
      if (!form.getAttribute("action")) {
        setStatus("success", "Vorschau: Hier wird nichts gesendet. Auf der echten Seite geht die Anmeldung an MailerLite.");
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(form.action, { method: "POST", body: new FormData(form), headers: { Accept: "application/json" } });
        const result = await response.json();
        if (result.success) {
          succeed();
          return;
        }
        setLoading(false);
        if (result.errors?.fields?.email && email) {
          showFieldError(email, "Bitte gib eine gültige E-Mail-Adresse ein.");
        } else {
          setStatus("error", "Die Anmeldung hat leider nicht geklappt. Bitte versuche es in ein paar Minuten noch einmal.");
        }
      } catch (error) {
        setLoading(false);
        setStatus("error", "Die Verbindung hat nicht geklappt. Bitte prüfe deine Internetverbindung und versuche es noch einmal.");
      }
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

  gsap.timeline({ defaults: { ease: MOTION.ease } })
    // Headline, intro text and portrait only move (no fade): they are the
    // largest elements, so they must be visible – and measurable as LCP – at once.
    .from([".hero-text h1", ".hero-subline"], { y: isSmall ? 18 : 26, duration: 1.1, stagger: 0.08, clearProps: "transform" }, 0)
    .from(".hero-portrait img", { y: isSmall ? 20 : 28, duration: 1.3, clearProps: "transform" }, 0)
    .from([".hero-text .eyebrow", ".hero-buttons", ".hero-facts"], { y: isSmall ? 18 : 24, autoAlpha: 0, duration: MOTION.duration, stagger: 0.1, clearProps: "transform,opacity,visibility" }, 0.1)
    .from(".hero-badge", { y: 16, autoAlpha: 0, duration: 0.8, clearProps: "transform,opacity,visibility" }, 0.6);
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
