const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
const lerp = (a, b, t) => a + (b - a) * t;
const INTRO_REVEAL_THRESHOLD = 0.2;
const CARD_TIMELINE_UNITS = 7;
const CARD_PHASE_UNITS = 2;
const CARD_EXIT_UNITS = 3;
const CARD_GAP_MULTIPLIER = 1.56;
const MAX_STACK_STEP = 0.084;
const TWO_CARD_SCALE_RATIO = 0.88;
const THREE_CARD_PURPLE_SCALE = 0.87;
const THREE_CARD_YELLOW_RATIO = 0.84;
const THREE_CARD_YELLOW_SCALE = THREE_CARD_PURPLE_SCALE * THREE_CARD_YELLOW_RATIO;
const THREE_CARD_WIDTH_RAMP_UNITS = 1.5;
const THREE_CARD_GAP_EXPAND_START = 0.4;
const THREE_CARD_GAP_EXPAND_END = 1.7;
const THREE_CARD_GAP_INCREASE = 0.20;
const FINAL_CARD_GROWTH_UNITS = 1.35;
const TWO_CARD_EDGE_GAP = (MAX_STACK_STEP * CARD_GAP_MULTIPLIER - 0.075) * 0.80;
const TWO_CARD_FINAL_OFFSET = (TWO_CARD_EDGE_GAP + 0.075) / CARD_GAP_MULTIPLIER;
const MAX_YELLOW_OFFSET = MAX_STACK_STEP + TWO_CARD_FINAL_OFFSET;
const BACK_CARD_SCALE_MULTIPLIER = 0.95;
const LAST_CARD_SCALE_MULTIPLIER = 0.95 * BACK_CARD_SCALE_MULTIPLIER;
const SCROLL_SCRUB_MS = 250;
const READER_ITEM_BASE_GAP = 48;
const READER_ITEM_ACTIVE_EXTRA_GAP = 170;
const READER_ENTRY_START = -0.18;
const READER_FIRST_READ = 0.14;
const READER_LAST_READ = 0.88;
const READER_ENTRY_SPACER = 170;
const READER_ITEM_TRAVEL = 64;
const READER_TOP_OFFSET = -40;
const READER_BODY_FADE_START = 0.4;
const READER_BODY_FADE_END = 0.52;

// A single scroll coordinate drives both the deck and its reading states.
export function initializePlanReader() {
  const reader = document.querySelector('.plan-reader');
  const scene = reader.querySelector('.plan-reader__scene');
  const left = reader.querySelector('.plan-reader__intro');
  const list = reader.querySelector('.plan-reader__list');
  const items = [...reader.querySelectorAll('.plan-reader__item')];
  const cards = ['blue', 'purple', 'peach'].map(color => reader.querySelector(`.growth-card--${color}`));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1000px)');
  let frame = 0;
  let lastTime = 0;
  let current = null;
  let cardCurrent = null;
  let geometry;

  function measure() {
    const vh = window.innerHeight;
    const rect = reader.getBoundingClientRect();
    const stack = reader.querySelector('.growth-card-stack');
    geometry = {
      top: rect.top + window.scrollY,
      vh,
      pinTop: Math.max(32, (vh - scene.offsetHeight) / 2),
      width: stack.offsetWidth,
      runway: Math.max(1, reader.offsetHeight - scene.offsetHeight),
      listEndY: left.offsetTop + READER_TOP_OFFSET - list.offsetTop,
    };
    current = null;
    cardCurrent = null;
    schedule();
  }

  function draw(time) {
    frame = 0;
    if (reduced.matches || compact.matches) return;
    const { top, pinTop, vh, width, runway } = geometry;
    const raw = (window.scrollY - top + pinTop) / runway;
    const target = clamp(raw, READER_ENTRY_START, 1);
    const dt = Math.min(64, time - (lastTime || time));
    lastTime = time;
    current = current === null ? target : lerp(current, target, 1 - Math.exp(-dt / SCROLL_SCRUB_MS));
    if (Math.abs(current - target) < 0.0001) current = target;
    // Animation starts before pinning; Lassie uses separate animation/pin ranges.
    const cardTarget = clamp((window.scrollY - top + vh / 2 + 100) / (3 * vh));
    cardCurrent = cardCurrent === null ? cardTarget : lerp(cardCurrent, cardTarget, 1 - Math.exp(-dt / SCROLL_SCRUB_MS));
    if (Math.abs(cardCurrent - cardTarget) < 0.0001) cardCurrent = cardTarget;
    // A separate -1 → 0 entry lets the first title rise before its body appears.
    const progress = current <= READER_FIRST_READ
      ? -1 + clamp((current - READER_ENTRY_START) / (READER_FIRST_READ - READER_ENTRY_START))
      : clamp((current - READER_FIRST_READ) / (READER_LAST_READ - READER_FIRST_READ)) * 2;
    const entrance = clamp((window.scrollY - top + vh * 0.68) / (vh * 0.68 - pinTop));
    const introVisible = entrance >= INTRO_REVEAL_THRESHOLD;
    left.dataset.visible = String(introVisible);
    left.inert = !introVisible;
    list.style.opacity = entrance;
    list.inert = entrance < 0.05;
    const smoothstep = value => value * value * (3 - 2 * value);
    // Derive the entire reading track backward from its upper limit, including the intro's top offset.
    // Every state approaches that limit from below; no final correction reverses its direction.
    const remainingItems = items.length - 1 - progress;
    const listTrackY = geometry.listEndY + remainingItems * READER_ITEM_TRAVEL
      + READER_ENTRY_SPACER * clamp(-progress);
    list.style.transform = `translateY(${listTrackY}px)`;
    items.forEach((item, index) => {
      const distance = Math.abs(progress - index);
      const opacity = distance <= 1 ? lerp(1, 0.5, distance) : lerp(0.5, 0.3, clamp(distance - 1));
      item.querySelector('h3').style.opacity = opacity;
      const visibility = clamp(1 - distance);
      item.style.marginBottom = `${READER_ITEM_BASE_GAP + READER_ITEM_ACTIVE_EXTRA_GAP * visibility}px`;
      const button = item.querySelector('button');
      button.setAttribute('aria-current', String(index === Math.round(progress)));
      const body = item.querySelector('.plan-reader__body');
      if (body) {
        const fade = smoothstep(clamp((distance - READER_BODY_FADE_START)
          / (READER_BODY_FADE_END - READER_BODY_FADE_START)));
        const paragraph = body.firstElementChild;
        paragraph.style.opacity = 1 - fade;
        paragraph.style.filter = `blur(${fade * 4.75}px)`;
        paragraph.style.transform = `translateY(${fade * 6}px)`;
        body.style.height = `${paragraph.offsetHeight * visibility}px`;
        body.style.marginTop = `${12 * visibility}px`;
        body.setAttribute('aria-hidden', String(index !== Math.round(progress)));
        button.setAttribute('aria-expanded', String(index === Math.round(progress)));
      }
    });
    // Independent, overlapping tracks: spread → recover → exit.
    // All start at .95 / 10%; both rear cards are reduced, with an extra 5% on the final card.
    const cardTime = cardCurrent * CARD_TIMELINE_UNITS;
    const phase = start => clamp((cardTime - start) / CARD_PHASE_UNITS);
    const widthRamp = clamp(cardTime / THREE_CARD_WIDTH_RAMP_UNITS);
    const widthRampEased = widthRamp * widthRamp * (3 - 2 * widthRamp);
    const cardHeight = width * 420 / 480;
    cards.forEach((card, index) => {
      let scale;
      let referenceScale;
      let offset;
      if (index === 0) {
        referenceScale = lerp(0.95, 1, phase(0));
        scale = referenceScale;
        offset = lerp(0.10, 0, phase(0));
      } else if (index === 1) {
        referenceScale = cardTime <= 2 ? lerp(0.95, 0.85, phase(0)) : lerp(0.85, 1, phase(2));
        scale = cardTime <= 2
          ? lerp(0.95 * BACK_CARD_SCALE_MULTIPLIER, THREE_CARD_PURPLE_SCALE, widthRampEased)
          : lerp(THREE_CARD_PURPLE_SCALE, 1, phase(2));
        offset = cardTime <= 2 ? lerp(0.10, MAX_STACK_STEP, phase(0)) : lerp(MAX_STACK_STEP, 0, phase(2));
      } else {
        const finalCardProgress = clamp((cardTime - 4) / FINAL_CARD_GROWTH_UNITS);
        referenceScale = cardTime <= 2 ? lerp(0.95, 0.70, phase(0))
          : cardTime <= 4 ? lerp(0.70, 0.85, phase(2)) : lerp(0.85, 1, finalCardProgress);
        const twoCardProgress = phase(2);
        const twoCardRatio = lerp(THREE_CARD_YELLOW_RATIO, TWO_CARD_SCALE_RATIO, clamp(twoCardProgress / 0.35));
        const purpleReferenceScale = lerp(0.85, 1, twoCardProgress);
        const activePurpleScale = lerp(THREE_CARD_PURPLE_SCALE, 1, twoCardProgress);
        const purpleOffset = lerp(MAX_STACK_STEP, 0, twoCardProgress);
        const lockedTwoCardOffset = (
          purpleOffset * CARD_GAP_MULTIPLIER
          + purpleReferenceScale / 2
          + TWO_CARD_EDGE_GAP
          - referenceScale / 2
        ) / CARD_GAP_MULTIPLIER;
        scale = cardTime <= 2
          ? lerp(0.95 * LAST_CARD_SCALE_MULTIPLIER, THREE_CARD_YELLOW_SCALE, widthRampEased)
          : cardTime <= 4
            ? activePurpleScale * twoCardRatio
            : lerp(TWO_CARD_SCALE_RATIO, 1, finalCardProgress);
        offset = cardTime <= 2 ? lerp(0.10, MAX_YELLOW_OFFSET, phase(0))
          : cardTime <= 4
            ? lockedTwoCardOffset
            : lerp(TWO_CARD_FINAL_OFFSET, 0, finalCardProgress);
        if (cardTime < 4) {
          const purpleReference = cardTime <= 2 ? lerp(0.95, 0.85, phase(0)) : purpleReferenceScale;
          const purpleStackOffset = cardTime <= 2 ? lerp(0.10, MAX_STACK_STEP, phase(0)) : purpleOffset;
          const currentGap = (offset - purpleStackOffset) * CARD_GAP_MULTIPLIER
            + (referenceScale - purpleReference) / 2;
          const expand = smoothstep(clamp((cardTime - THREE_CARD_GAP_EXPAND_START)
            / (THREE_CARD_GAP_EXPAND_END - THREE_CARD_GAP_EXPAND_START)));
          // Release the extra spacing as teal's bottom crosses purple's centre.
          const tealExit = clamp((cardTime - CARD_PHASE_UNITS) / CARD_EXIT_UNITS);
          const tealExitEased = 1 - (1 - tealExit) ** 2;
          const tealBottomToPurpleCentre = cardHeight / 2 - tealExitEased * vh
            - (purpleOffset * CARD_GAP_MULTIPLIER + (purpleReferenceScale - activePurpleScale) / 2) * cardHeight;
          const distanceAtExitStart = (0.5 - MAX_STACK_STEP * CARD_GAP_MULTIPLIER
            - (0.85 - THREE_CARD_PURPLE_SCALE) / 2) * cardHeight;
          const restore = cardTime <= CARD_PHASE_UNITS ? 0
            : smoothstep(clamp(1 - tealBottomToPurpleCentre / distanceAtExitStart));
          offset += currentGap * THREE_CARD_GAP_INCREASE * expand * (1 - restore) / CARD_GAP_MULTIPLIER;
        }
      }
      const exit = index < 2 ? clamp((cardTime - (index + 1) * CARD_PHASE_UNITS) / CARD_EXIT_UNITS) : 0;
      // Matches the measured quadratic ease-out of Lassie's nested exit tween.
      const exitEased = 1 - (1 - exit) ** 2;
      // Scale around the centre, preserving card proportions and rounded corners.
      // The final card has no local exit: native sticky release carries it away.
      const scaleCompensation = (referenceScale - scale) * cardHeight / 2;
      const stackOffset = offset * CARD_GAP_MULTIPLIER * cardHeight + scaleCompensation;
      card.style.transform = `translate(-50%, ${stackOffset - exitEased * vh}px) scale(${scale})`;
    });
    if (current !== target || cardCurrent !== cardTarget) frame = requestAnimationFrame(draw);
  }
  function schedule() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function reset() {
    [left, list, ...cards, ...items, ...items.flatMap(item => [...item.querySelectorAll('h3, .plan-reader__body, .plan-reader__body p')])].forEach(el => el.removeAttribute('style'));
    left.dataset.visible = String(compact.matches || reduced.matches);
    items.forEach(item => {
      item.querySelector('button').setAttribute('aria-current', 'false');
      const body = item.querySelector('.plan-reader__body');
      if (body) { body.removeAttribute('aria-hidden'); item.querySelector('button').setAttribute('aria-expanded', 'true'); }
    });
    left.inert = false;
    list.inert = false;
    measure();
  }
  const onClick = event => {
    const button = event.target.closest('[data-plan-index]');
    if (!button || compact.matches || reduced.matches) return;
    const p = READER_FIRST_READ + Number(button.dataset.planIndex)
      / (items.length - 1) * (READER_LAST_READ - READER_FIRST_READ);
    window.scrollTo({ top: geometry.top - geometry.pinTop + geometry.runway * p, behavior: 'smooth' });
  };
  list.addEventListener('click', onClick);
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', measure, { passive: true });
  reduced.addEventListener('change', reset);
  compact.addEventListener('change', reset);
  const observer = new ResizeObserver(measure);
  observer.observe(document.querySelector('.growth-plans__stage'));
  document.fonts.ready.then(measure);
  measure();
  return () => {
    cancelAnimationFrame(frame);
    observer.disconnect();
    window.removeEventListener('scroll', schedule);
    window.removeEventListener('resize', measure);
    reduced.removeEventListener('change', reset);
    compact.removeEventListener('change', reset);
    list.removeEventListener('click', onClick);
  };
}
