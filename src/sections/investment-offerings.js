const offerings = [
  {
    title: "Naira & Dollar Vaults: Your passive income champions",
    subtitle: "Put your idle Naira or dollars to work with flexible vaults built to earn steady interest while keeping your money within reach.",
    riskIcon: "ri-tree-fill",
    risk: "Low risk",
    returns: [["Naira vault returns", "Up to 23% p.a"], ["Dollar vault returns", "10% p.a"]],
    color: "#82d9df",
  },
  {
    title: "Real Estate: Stability & Cashflow",
    subtitle: "Our US fractional real estate portfolio offers monthly rental income, price appreciation, and long-term security.",
    riskIcon: "ri-star-fill",
    risk: "Medium risk",
    returns: [["Historical returns", "14.4% p.a"]],
    color: "#c9b8f4",
  },
  {
    title: "Growth Stocks: Growth & Performance",
    subtitle: "Invest in a professionally managed portfolio of high-growth global companies selected for their long-term potential.",
    riskIcon: "ri-fire-fill",
    risk: "High risk",
    returns: [["Historical returns", "14% p.a"]],
    color: "#f6c7a8",
  },
  {
    title: "Dividend Income: Steady payouts, long-term growth",
    subtitle: "Build an income-focused portfolio of established companies selected for dependable dividends and the potential to grow over time.",
    riskIcon: "ri-money-dollar-circle-fill",
    risk: "Medium risk",
    returns: [["Dividend yield", "Varies by portfolio"]],
    color: "#d6c9ff",
  },
  {
    title: "And Other Global Plans for You",
    subtitle: "Explore professionally managed global plans across regions and asset classes, with more ways to diversify as your goals evolve.",
    riskIcon: "ri-global-line",
    risk: "Varied risk",
    returns: [["Historical returns", "8–15%+ p.a"]],
    color: "#91d6c5",
  },
];

function createProgress() {
  const progress = document.createElement("div");
  progress.className = "offerings__progress";
  progress.setAttribute("aria-hidden", "true");
  offerings.forEach((_, index) => {
    const segment = document.createElement("span");
    segment.className = "offerings__progress-segment";
    segment.dataset.progressIndex = index;
    segment.innerHTML = "<span></span>";
    progress.append(segment);
  });
  return progress;
}

function createOfferingSlide(offering, index) {
  const slide = document.createElement("article");
  slide.className = "offerings__slide";
  slide.dataset.offeringSlide = index;
  slide.innerHTML = `
    <div class="offerings__copy">
      <h2>${offering.title}</h2>
      <p>${offering.subtitle}</p>
    </div>
    <div class="offerings__metadata">
      <p class="offerings__risk"><i class="${offering.riskIcon}" aria-hidden="true"></i><span>${offering.risk}</span></p>
      ${offering.returns.map(([label, value]) => `
        <span class="offerings__divider" aria-hidden="true"></span>
        <p class="offerings__return"><span>${label}:</span><strong>${value}</strong></p>
      `).join("")}
    </div>
  `;
  return slide;
}

function createActions() {
  const actions = document.createElement("div");
  actions.className = "offerings__actions";
  actions.innerHTML = `
    <a class="offerings__button offerings__button--primary" href="https://app.risevest.com/sign-up/select-country" target="_blank" rel="noreferrer">
      <span>Start investing</span><i class="ri-arrow-right-line" aria-hidden="true"></i>
    </a>
    <a class="offerings__button offerings__button--download" href="https://risevest.com/download" target="_blank" rel="noreferrer">
      <span class="offerings__stores" aria-hidden="true"><i class="ri-apple-fill"></i><span></span><i class="ri-google-play-fill"></i></span>
      <span>Download app</span>
    </a>
  `;
  return actions;
}

export function createInvestmentOfferingsSection() {
  const runway = document.createElement("section");
  runway.className = "offerings-runway";
  runway.id = "investment-offerings";
  runway.dataset.activeOffering = "0";
  runway.setAttribute("aria-label", "Rise investment offerings");

  const sticky = document.createElement("div");
  sticky.className = "offerings";
  const stage = document.createElement("div");
  stage.className = "offerings__stage";

  const content = document.createElement("div");
  content.className = "offerings__content";
  content.append(createProgress());

  const viewport = document.createElement("div");
  viewport.className = "offerings__slides-viewport";
  viewport.setAttribute("aria-live", "polite");
  viewport.setAttribute("aria-atomic", "true");
  const track = document.createElement("div");
  track.className = "offerings__slides-track";
  offerings.forEach((offering, index) => track.append(createOfferingSlide(offering, index)));
  viewport.append(track);
  content.append(viewport, createActions());

  const visual = document.createElement("div");
  visual.className = "offerings__visual";
  visual.setAttribute("role", "img");
  visual.setAttribute("aria-label", "Investment plan visual placeholder");
  visual.style.setProperty("--offering-color", offerings[0].color);

  stage.append(content, visual);
  sticky.append(stage);
  runway.append(sticky);
  runway.offerings = offerings;
  return runway;
}

export { offerings };
