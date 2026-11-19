"use strict";

/* =========================================================
   COACH DICH LEICHT – SCRIPT.JS
   Navigation, carousel, forms and scroll reveals
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initMobileNavigation();
  initHomeLinks();
  initCarousel();
  initCustomFreebieForms();
  initInteractiveFaq();
  setCurrentYear();
  initScrollReveals();
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

function initInteractiveFaq(){const quiz=document.querySelector("[data-faq-quiz]");if(!quiz)return;const slides=[...quiz.querySelectorAll("[data-quiz-slide]")],result=quiz.querySelector("[data-quiz-result]"),resultText=quiz.querySelector("[data-result-text]"),bar=quiz.querySelector("[data-progress-bar]"),answers=new Array(slides.length).fill(null);let step=0;const show=panel=>{[...slides,result].forEach(x=>x.hidden=x!==panel);if(!matchMedia("(prefers-reduced-motion: reduce)").matches)panel.animate([{opacity:0,translate:"0 14px"},{opacity:1,translate:"0 0"}],{duration:650,easing:"cubic-bezier(0.22, 1, 0.36, 1)"});};const progress=n=>bar.style.width=`${n/slides.length*100}%`;slides.forEach((slide,i)=>{const choices=[...slide.querySelectorAll("[data-answer]")],box=slide.querySelector("[data-quiz-response]"),yes=slide.querySelector(".faq-response-yes"),no=slide.querySelector(".faq-response-no"),next=slide.querySelector("[data-quiz-next]");choices.forEach(btn=>btn.addEventListener("click",()=>{answers[i]=btn.dataset.answer;choices.forEach(x=>x.setAttribute("aria-pressed",String(x===btn)));yes.hidden=btn.dataset.answer!=="yes";no.hidden=btn.dataset.answer!=="no";box.hidden=false;next.hidden=false;progress(i+1);}));next.addEventListener("click",()=>{if(!answers[i])return;if(i===slides.length-1){const n=answers.filter(x=>x==="yes").length;resultText.textContent=n>=6?`Du hast ${n} Fragen mit Ja beantwortet. Eine persönliche Begleitung könnte sehr gut zu deiner aktuellen Situation passen.`:n>=3?`Du hast ${n} Fragen mit Ja beantwortet. Reset28 oder ein Kennenlerngespräch können dir helfen, den passenden nächsten Schritt zu finden.`:`Du hast ${n} Fragen mit Ja beantwortet. Auch wenn aktuell nur wenige Punkte zutreffen, kannst du deine Fragen unverbindlich im Kennenlerngespräch klären.`;show(result);}else{step=i+1;show(slides[step]);}});});quiz.querySelector("[data-quiz-restart]").addEventListener("click",()=>{answers.fill(null);slides.forEach(slide=>{slide.querySelectorAll("[data-answer]").forEach(b=>b.setAttribute("aria-pressed","false"));slide.querySelector("[data-quiz-response]").hidden=true;slide.querySelector("[data-quiz-next]").hidden=true;});progress(0);show(slides[0]);});progress(0);show(slides[0]);}
/* ---------------------------
   Footer year
   --------------------------- */
function setCurrentYear() {
  const year = document.querySelector("#current-year");
  if (year) year.textContent = String(new Date().getFullYear());
}

/* ---------------------------
   Scroll reveals
   The browser reports when an element enters the viewport; the fly-in itself
   is a CSS keyframe animation on `translate` and `opacity` (see style.css), so
   it runs on the compositor and never fights hover transitions on `transform`.
   Elements arriving together get a short stagger and land as a gentle wave.
   --------------------------- */
function initScrollReveals() {
  const root = document.documentElement;
  clearTimeout(window.__motionFallback);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) {
    root.classList.remove("motion-ready");
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    const entering = entries
      .filter((entry) => entry.isIntersecting)
      .map((entry) => entry.target)
      .sort((a, b) => {
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        return ra.top - rb.top || ra.left - rb.left;
      });

    entering.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${Math.min(index, 5) * 0.12}s`);
      element.classList.add("is-revealed");
      observer.unobserve(element);
    });
  }, { rootMargin: "0px 0px -12% 0px" });

  document.querySelectorAll(".fade-up, .slide-left, .slide-right").forEach((element) => observer.observe(element));
}
