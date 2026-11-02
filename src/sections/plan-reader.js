import { createButton } from "../components/button.js";

export function createPlanReader(stack) {
  const reader = document.createElement("section");
  reader.className = "plan-reader";
  reader.id = "investment-plans";
  reader.setAttribute("aria-labelledby", "plan-reader-title");
  const scene = document.createElement("div");
  scene.className = "plan-reader__scene";
  const left = document.createElement("div");
  left.className = "plan-reader__intro";
  left.innerHTML = '<h2 id="plan-reader-title">Plans built around how you want to grow</h2>';
  const button = createButton({ label: "Start investing", href: "https://app.risevest.com/" });
  const arrow = document.createElement("img");
  arrow.src = "./assets/plans/arrow-right.svg";
  arrow.alt = "";
  arrow.width = 24;
  arrow.height = 24;
  button.append(arrow);
  left.append(button);

  const list = document.createElement("ol");
  list.className = "plan-reader__list";
  const placeholder = "Looking for safe, consistent growth? Our fixed-income plan is ideal for low-risk investors seeking predictable annual p.a.";
  ["Dollar Mutual Fund", "Money Market Fund", "Naira Equity Portfolio"].forEach((name, index) => {
    const item = document.createElement("li");
    item.className = "plan-reader__item";
    item.innerHTML = `<h3><button type="button" data-plan-index="${index}" aria-current="${index === 0 ? 'true' : 'false'}"><span class="plan-reader__icon"><img src="./assets/plans/dollar-fund.png" alt="" width="28" height="28"></span><span>${name}</span></button></h3>`;
    const body = document.createElement("div");
    body.className = "plan-reader__body";
    body.id = `plan-description-${index}`;
    const paragraph = document.createElement("p");
    paragraph.textContent = placeholder;
    body.append(paragraph);
    item.querySelector("button").setAttribute("aria-controls", body.id);
    item.append(body);
    list.append(item);
  });
  scene.append(stack, left, list);
  reader.append(scene);
  return reader;
}
