import { offerings } from "../sections/investment-offerings.js";

const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function initializeInvestmentOfferings() {
  const runway = document.querySelector(".offerings-runway");
  if (!runway) return () => {};

  const sticky = runway.querySelector(".offerings");
  const track = runway.querySelector(".offerings__slides-track");
  const slides = [...runway.querySelectorAll(".offerings__slide")];
  const segments = [...runway.querySelectorAll(".offerings__progress-segment")];
  const visual = runway.querySelector(".offerings__visual");
  const desktop = matchMedia("(min-width: 901px)");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  let measurements = [];
  let runwayTop = 0;
  let runwayLength = 1;
  let frame = 0;
  let activeIndex = -1;

  function measure() {
    const rect = runway.getBoundingClientRect();
    runwayTop = rect.top + window.scrollY;
    runwayLength = Math.max(1, runway.offsetHeight - sticky.offsetHeight);
    measurements = slides.map(slide => ({ top: slide.offsetTop, height: slide.offsetHeight }));
    draw();
  }

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;
    runway.dataset.activeOffering = index;
    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === index;
      slide.dataset.active = String(isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.inert = !isActive;
    });
    segments.forEach((segment, segmentIndex) => segment.dataset.active = String(segmentIndex === index));
    visual.style.setProperty("--offering-color", offerings[index].color);
    visual.setAttribute("aria-label", `${offerings[index].title} visual placeholder`);
  }

  function draw() {
    frame = 0;
    if (reduced.matches) {
      setActive(0);
      track.style.removeProperty("transform");
      segments.forEach((segment, index) => {
        segment.firstElementChild.style.width = index === 0 ? "100%" : "0%";
      });
      return;
    }

    const progress = clamp((window.scrollY - runwayTop) / runwayLength);
    const scaled = progress * offerings.length;
    const index = Math.min(Math.floor(scaled), offerings.length - 1);
    const local = index === offerings.length - 1 ? clamp(scaled - index) : scaled - index;
    setActive(index);

    const trackInset = desktop.matches ? 35 : 30;
    const y = index === 0 ? trackInset : -(measurements[index].top - trackInset);
    track.style.transform = `translateY(${y}px)`;
    segments.forEach((segment, segmentIndex) => {
      segment.firstElementChild.style.width = segmentIndex === index ? `${local * 100}%` : "0%";
    });
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", measure, { passive: true });
  desktop.addEventListener("change", measure);
  reduced.addEventListener("change", measure);
  document.fonts.ready.then(measure);
  measure();

  return () => {
    cancelAnimationFrame(frame);
    window.removeEventListener("scroll", schedule);
    window.removeEventListener("resize", measure);
    desktop.removeEventListener("change", measure);
    reduced.removeEventListener("change", measure);
  };
}
