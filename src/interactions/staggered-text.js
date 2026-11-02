const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

function getVisualLines(measure) {
  const textNode = measure.firstChild;
  if (!textNode) return [];

  const range = document.createRange();
  const lines = [];

  for (let index = 0; index < textNode.length; index += 1) {
    range.setStart(textNode, index);
    range.setEnd(textNode, index + 1);

    const rect = range.getBoundingClientRect();
    const lineTop = Math.round(rect.top);
    let line = lines.find((item) => item.top === lineTop);

    if (!line) {
      line = { top: lineTop, text: "" };
      lines.push(line);
    }

    line.text += textNode.textContent[index];
  }

  return lines
    .sort((a, b) => a.top - b.top)
    .map((line) => line.text.trim())
    .filter(Boolean);
}

function createAnimatedLayer(lines) {
  const layer = document.createElement("span");
  layer.className = "staggered-text__layer";
  layer.setAttribute("aria-hidden", "true");

  lines.forEach((line, index) => {
    const mask = document.createElement("span");
    mask.className = "staggered-text__mask";

    const segment = document.createElement("span");
    segment.className = "staggered-text__segment";
    segment.style.setProperty("--line-index", index);
    segment.textContent = line;

    mask.append(segment);
    layer.append(mask);
  });

  return layer;
}

function prepareHeading(heading) {
  const measure = heading.querySelector(".staggered-text__measure");
  if (!measure) return;

  heading.querySelector(".staggered-text__layer")?.remove();
  heading.append(createAnimatedLayer(getVisualLines(measure)));
}

export function initializeStaggeredText() {
  const headings = document.querySelectorAll("[data-staggered-text]");

  headings.forEach((heading) => {
    if (motionQuery.matches) {
      heading.dataset.animationState = "done";
      return;
    }

    let hasRun = false;
    let resizeFrame;
    prepareHeading(heading);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || hasRun) return;

        hasRun = true;
        heading.dataset.animationState = "animating";
        observer.unobserve(heading);

        const lineCount = heading.querySelectorAll(".staggered-text__segment").length;
        window.setTimeout(() => {
          heading.dataset.animationState = "done";
        }, 914 + 59 * Math.max(0, lineCount - 1));
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      },
    );

    observer.observe(heading);

    window.addEventListener("resize", () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        prepareHeading(heading);
        if (hasRun) heading.dataset.animationState = "done";
      });
    });
  });
}
