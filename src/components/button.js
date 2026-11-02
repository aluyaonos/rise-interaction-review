export function createButton({ label, href = "#" }) {
  const button = document.createElement("a");
  button.className = "button button--primary";
  button.href = href;
  button.textContent = label;
  return button;
}
