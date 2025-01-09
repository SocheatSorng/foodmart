function showLoadingSkeleton(container, count = 8) {
  if (!container) {
    console.error("Container element not found");
    return;
  }

  const template = document.getElementById("skeleton-template");
  if (!template) {
    console.error("Skeleton template not found");
    return;
  }

  container.innerHTML = "";

  for (let i = 0; i < count; i++) {
    const clone = template.content.cloneNode(true);
    container.appendChild(clone);
  }
}

function hideLoadingSkeleton(container) {
  if (!container) {
    console.error("Container element not found");
    return;
  }
  container.innerHTML = "";
}
