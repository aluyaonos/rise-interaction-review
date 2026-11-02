import { createManagedInvestingSection } from "./sections/managed-investing.js";
import { createGrowthPlansSection } from "./sections/growth-plans.js?v=61";
import { initializeStaggeredText } from "./interactions/staggered-text.js";
import { initializePlanReader } from "./interactions/plan-reader.js?v=63";
import { createInvestmentOfferingsSection } from "./sections/investment-offerings.js";
import { initializeInvestmentOfferings } from "./interactions/investment-offerings.js";

const app = document.querySelector("#app");

app.append(
  createManagedInvestingSection(),
  createGrowthPlansSection(),
  createInvestmentOfferingsSection(),
);
// Measure line breaks only after Tomato Grotesk has resolved.
document.fonts.ready.then(initializeStaggeredText);
initializePlanReader();
initializeInvestmentOfferings();
