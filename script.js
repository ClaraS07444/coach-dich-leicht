"use strict";

/* =========================================================
   COACH DICH LEICHT – SCRIPT.JS
   Navigation, carousel, forms and GSAP animations
   ========================================================= */

document.documentElement.classList.add("js");

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initSmoothScroll();
  initCarousel();
  initForms();
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
   Smooth internal scrolling
   --------------------------- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      const selector = link.getAttribute("href");
      if (!selector || selector === "#") return;

      event.preventDefault();

      if (selector === "#startseite") {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "smooth"
        });
        history.replaceState(null, "", window.location.pathname + window.location.search);
        return;
      }

      const target = document.querySelector(selector);
      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
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

  previousButton?.addEventListener("click", () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
  });

  nextButton?.addEventListener("click", () => {
    track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
  });

  track.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      track.scrollBy({ left: -getScrollAmount(), behavior: "smooth" });
    }

    if (event.key === "ArrowRight") {
      event.preventDefault();
      track.scrollBy({ left: getScrollAmount(), behavior: "smooth" });
    }
  });
}

/* ---------------------------
   Form validation
   The final submission endpoint must be configured before launch.
   --------------------------- */
function initForms() {
  document.querySelectorAll("form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      clearFormErrors(form);

      if (!form.checkValidity()) {
        event.preventDefault();
        showFormErrors(form);
        form.querySelector(":invalid")?.focus();
        return;
      }

      if (form.dataset.unconfigured === "true" || !form.getAttribute("action")) {
        event.preventDefault();
        const status = form.querySelector(".form-status");
        if (status) {
          status.className = "form-status is-error";
          status.textContent = "Das Formular ist vorbereitet, aber der Versand muss vor der Veröffentlichung noch mit dem gewählten Formularanbieter verbunden werden.";
        }
      }
    });
  });
}

function showFormErrors(form) {
  form.querySelectorAll("input, textarea, select").forEach((field) => {
    if (field.validity.valid) return;

    field.setAttribute("aria-invalid", "true");
    const error = field.closest(".form-field")?.querySelector(".field-error");
    if (!error) return;

    if (field.validity.valueMissing) {
      error.textContent = "Bitte fülle dieses Pflichtfeld aus.";
    } else if (field.validity.typeMismatch) {
      error.textContent = "Bitte gib eine gültige E-Mail-Adresse ein.";
    } else {
      error.textContent = "Bitte überprüfe deine Eingabe.";
    }
  });

  const uncheckedPrivacy = form.querySelector('input[type="checkbox"][required]:not(:checked)');
  if (uncheckedPrivacy) {
    const status = form.querySelector(".form-status");
    if (status) {
      status.className = "form-status is-error";
      status.textContent = "Bitte bestätige die Datenschutzerklärung.";
    }
  }
}

function clearFormErrors(form) {
  form.querySelectorAll('[aria-invalid="true"]').forEach((field) => {
    field.removeAttribute("aria-invalid");
  });

  form.querySelectorAll(".field-error").forEach((error) => {
    error.textContent = "";
  });

  const status = form.querySelector(".form-status");
  if (status) {
    status.className = "form-status";
    status.textContent = "";
  }
}

function initInteractiveFaq(){const quiz=document.querySelector("[data-faq-quiz]");if(!quiz)return;const slides=[...quiz.querySelectorAll("[data-quiz-slide]")],result=quiz.querySelector("[data-quiz-result]"),resultText=quiz.querySelector("[data-result-text]"),bar=quiz.querySelector("[data-progress-bar]"),answers=new Array(slides.length).fill(null);let step=0;const show=panel=>{[...slides,result].forEach(x=>x.hidden=x!==panel);if(window.gsap&&!matchMedia("(prefers-reduced-motion: reduce)").matches)gsap.fromTo(panel,{autoAlpha:0,y:14},{autoAlpha:1,y:0,duration:.65,ease:"sine.out",clearProps:"transform,opacity,visibility"});};const progress=n=>bar.style.width=`${n/slides.length*100}%`;slides.forEach((slide,i)=>{const choices=[...slide.querySelectorAll("[data-answer]")],box=slide.querySelector("[data-quiz-response]"),yes=slide.querySelector(".faq-response-yes"),no=slide.querySelector(".faq-response-no"),next=slide.querySelector("[data-quiz-next]");choices.forEach(btn=>btn.addEventListener("click",()=>{answers[i]=btn.dataset.answer;choices.forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));yes.hidden=btn.dataset.answer!=="yes";no.hidden=btn.dataset.answer!=="no";box.hidden=false;next.hidden=false;progress(i+1);}));next.addEventListener("click",()=>{if(!answers[i])return;if(i===slides.length-1){const n=answers.filter(x=>x==="yes").length;resultText.textContent=n>=6?`Du hast ${n} Fragen mit Ja beantwortet. Eine persönliche Begleitung könnte sehr gut zu deiner aktuellen Situation passen.`:n>=3?`Du hast ${n} Fragen mit Ja beantwortet. Reset28 oder ein Kennenlerngespräch können dir helfen, den passenden nächsten Schritt zu finden.`:`Du hast ${n} Fragen mit Ja beantwortet. Auch wenn aktuell nur wenige Punkte zutreffen, kannst du deine Fragen unverbindlich im Kennenlerngespräch klären.`;show(result);}else{step=i+1;show(slides[step]);}});});quiz.querySelector("[data-quiz-restart]").addEventListener("click",()=>{answers.fill(null);slides.forEach(slide=>{slide.querySelectorAll("[data-answer]").forEach(b=>b.setAttribute("aria-pressed","false"));slide.querySelector("[data-quiz-response]").hidden=true;slide.querySelector("[data-quiz-next]").hidden=true;});progress(0);show(slides[0]);});progress(0);show(slides[0]);}
/* ---------------------------
   Footer year
   --------------------------- */
function setCurrentYear() {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
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
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    window.gsap.set(
      [".hero-logo", ".hero-text", ".hero-buttons", ".hero-cloud-left", ".hero-cloud-right", ".section-cloud", ".fade-up", ".slide-left", ".slide-right"],
      { clearProps: "all" }
    );
    return;
  }

  initHeroAnimation();
  initSectionCloudAnimations();
  initScrollAnimations();

  window.addEventListener("load", () => {
    window.ScrollTrigger.refresh();
  });
}

/* ---------------------------
   Hero intro
   --------------------------- */
function initHeroAnimation() {
  const heroTimeline = window.gsap.timeline({
    defaults: {
      ease: "power2.out"
    }
  });

  heroTimeline
    .from(".hero-cloud-left", {
      xPercent: -125,
      opacity: 0,
      duration: 2.4,
      ease: "power1.out",
      clearProps: "transform,opacity"
    })
    .from(
      ".hero-cloud-right",
      {
        xPercent: 125,
        opacity: 0,
        duration: 2.4,
        ease: "power2.out",
        clearProps: "transform,opacity"
      },
      "<"
    )
    .from(
      ".hero-logo",
      {
        y: 58,
        opacity: 0,
        scale: 0.985,
        duration: 2.0,
        ease: "power2.out",
        clearProps: "transform,opacity"
      },
      "-=1.45"
    )
    .from(
      ".hero-text",
      {
        y: 32,
        opacity: 0,
        duration: 1.7,
        ease: "power2.out",
        clearProps: "transform,opacity"
      },
      "-=1.15"
    )
    .from(
      ".hero-buttons",
      {
        y: 22,
        opacity: 0,
        duration: 1.55,
        ease: "power2.out",
        clearProps: "transform,opacity"
      },
      "-=1.05"
    );
}


/* ---------------------------
   Decorative clouds in testimonials
   --------------------------- */
function initSectionCloudAnimations() {
  window.gsap.utils.toArray("section[id]").forEach((section) => {
    const leftCloud = section.querySelector(".section-cloud-left");
    const rightCloud = section.querySelector(".section-cloud-right");

    if (!leftCloud && !rightCloud) return;

    const clouds = [leftCloud, rightCloud].filter(Boolean);
    window.gsap.fromTo(
      clouds,
      {
        autoAlpha: 0,
        x: (index) => index === 0 ? -46 : 46
      },
      {
        autoAlpha: 1,
        x: 0,
        duration: 3.2,
        stagger: 0.08,
        ease: "sine.out",
        force3D: true,
        overwrite: "auto",
        scrollTrigger: {
          trigger: section,
          start: "top 84%",
          once: true,
          invalidateOnRefresh: true
        },
        onComplete: () => window.gsap.set(clouds, { clearProps: "transform,opacity,visibility" })
      }
    );
  });
}

/* ---------------------------
   ScrollTrigger animations
   --------------------------- */
function initScrollAnimations() {
  const media = window.gsap.matchMedia();

  media.add("(max-width: 767px)", () => {
    animateFadeUp(12, "top 94%", 2.2);
    animateMediaReveal(".slide-left, .slide-right", 10, "top 94%", 2.4);
  });

  media.add("(min-width: 768px)", () => {
    animateFadeUp(15, "top 92%", 2.4);
    animateMediaReveal(".slide-left, .slide-right", 12, "top 92%", 2.65);
  });
}

function animateFadeUp(distance, start, duration) {
  window.gsap.utils.toArray(".fade-up").forEach((element) => {
    window.gsap.fromTo(
      element,
      { autoAlpha: 0, y: distance },
      {
        autoAlpha: 1,
        y: 0,
        duration,
        ease: "sine.out",
        force3D: true,
        overwrite: "auto",
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
          invalidateOnRefresh: true
        },
        onComplete: () => window.gsap.set(element, { clearProps: "transform,opacity,visibility" })
      }
    );
  });
}

function animateMediaReveal(selector, distance, start, duration) {
  window.gsap.utils.toArray(selector).forEach((element) => {
    window.gsap.fromTo(
      element,
      { autoAlpha: 0, y: distance, scale: 0.995 },
      {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration,
        ease: "sine.out",
        force3D: true,
        overwrite: "auto",
        scrollTrigger: {
          trigger: element,
          start,
          once: true,
          invalidateOnRefresh: true
        },
        onComplete: () => window.gsap.set(element, { clearProps: "transform,opacity,visibility" })
      }
    );
  });
}

