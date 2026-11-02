export function createCheckIcon() {
  const namespace = "http://www.w3.org/2000/svg";
  const icon = document.createElementNS(namespace, "svg");
  const path = document.createElementNS(namespace, "path");

  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("width", "20");
  icon.setAttribute("height", "20");
  icon.setAttribute("aria-hidden", "true");
  icon.classList.add("check-icon");
  path.setAttribute("d", "M9.9997 15.1709 19.1921 5.97852l1.4142 1.41421L9.9997 17.9993l-6.36396-6.364 1.41421-1.4142L9.9997 15.1709Z");
  icon.append(path);

  return icon;
}
