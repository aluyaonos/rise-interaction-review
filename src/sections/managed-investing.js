import { createButton } from "../components/button.js";
import { createCheckIcon } from "../components/check-icon.js";

const benefits = [
  "Expert constructed portfolios.",
  "Multi-currency investments",
  "One on one coaching sessions",
  "Diverse asset classes",
  "Low fees (only 0.5% of AUM annually)",
];

function createBenefitList() {
  const list = document.createElement("ul");
  list.className = "benefit-list";

  benefits.forEach((benefit) => {
    const item = document.createElement("li");
    item.className = "benefit-list__item";
    item.append(createCheckIcon());

    const copy = document.createElement("span");
    copy.textContent = benefit;
    item.append(copy);
    list.append(item);
  });

  return list;
}

export function createManagedInvestingSection() {
  const section = document.createElement("section");
  section.className = "managed-investing";
  section.setAttribute("aria-labelledby", "managed-investing-title");

  const stage = document.createElement("div");
  stage.className = "managed-investing__stage";

  const content = document.createElement("div");
  content.className = "managed-investing__content";

  const title = document.createElement("h1");
  title.id = "managed-investing-title";
  title.className = "managed-investing__title";
  title.innerHTML = "Invest and relax.<br />We’ll manage your money.";

  content.append(title, createBenefitList(), createButton({ label: "Get started" }));

  const trust = document.createElement("div");
  trust.className = "trust-stat";
  trust.innerHTML = `
    <p class="trust-stat__eyebrow">Trusted by over</p>
    <p class="trust-stat__value">
      <span class="trust-stat__number">850,000</span>
      <span class="trust-stat__label">customers</span>
    </p>
  `;

  const visual = document.createElement("div");
  visual.className = "managed-investing__visual";
  visual.setAttribute("aria-hidden", "true");
  visual.innerHTML = `
    <div class="visual-panel visual-panel--primary"></div>
    <div class="visual-panel visual-panel--secondary"></div>
  `;

  stage.append(content, trust, visual);
  section.append(stage);
  return section;
}
