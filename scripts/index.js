// State

let photos = [];

const imageIntersectionObserver = observeIntersection();

// Constants

const CONSTANTS = {
  API_URL: "https://api.unsplash.com",
  API_KEY: "N02X3WfRqFebGeSgKmrJasrqXDXmeSal72qaFl4V8tI",
  debounceDelay: 900,
  themeLabels: {
    dark: "Dark theme",
    light: "Light theme",
  },
  paginationParams: {
    per_page: 30,
    page: 1,
  },
  placeholderImageUrl: "/assets/placeholder-image.png",
};

// Dom Elements
const cardsSectionElement = document.getElementById("images__container");

const themeLabelElement = document.getElementById("theme-label");

const themeIconElement = document.getElementById("theme-icon");

const themeCheckboxElement = document.getElementById("theme-switch");

// Event Listeners

themeCheckboxElement.addEventListener("change", onThemeChange);

// Functions

async function fetchImages() {
  const queryParams = getPayload();
  try {
    const apiURL = `${CONSTANTS.API_URL}/photos/?` + queryParams;
    const response = await fetch(apiURL);
    const data = await response.json();
    data && setImages(data);
  } catch (error) {
    console.error(error);
  } finally {
  }
}

function getPayload() {
  const queryParams = new URLSearchParams({
    client_id: CONSTANTS.API_KEY,
    per_page: CONSTANTS.paginationParams.per_page,
    page: CONSTANTS.paginationParams.page,
    order_by: "popular",
  });

  return queryParams.toString();
}

function setImages(response) {
  const imagesWithDescription = response.filter(
    (image) => image.description || image.alt_description
  );
  photos = imagesWithDescription;
  renderUI();
}

function renderUI() {
  photos.forEach((photo) => {
    const cardNode = getCardNodeHTML(photo);
    cardsSectionElement.appendChild(cardNode);
    imageIntersectionObserver.observe(cardNode.querySelector(".img-lazy"));
  });
}

function getCardNodeHTML(photo) {
  // Card container
  const cardContainerElement = document.createElement("div");
  setAttributesOfDomNode(cardContainerElement, { class: "card z-1" });

  // Image
  const imageElement = document.createElement("img");
  setAttributesOfDomNode(imageElement, {
    width: "100%",
    class: "card__img img-lazy",
    src: CONSTANTS.placeholderImageUrl,
    alt: photo.description || photo.alt_description,
    "data-src": photo.urls?.regular,
  });

  // Card body
  const cardBodyElement = document.createElement("div");
  setAttributesOfDomNode(cardBodyElement, { class: "card__body font-bold" });

  // Card title
  const cardTitleElement = document.createElement("h4");
  setAttributesOfDomNode(cardTitleElement, {
    class: "text-2xl card__title break-word capitalize line-clamp-2",
  });
  cardTitleElement.textContent = photo.description || photo.alt_description;

  // Card description
  const cardDescriptionElement = document.createElement("p");
  setAttributesOfDomNode(cardDescriptionElement, {
    class: "card__description mt-4",
  });
  cardDescriptionElement.textContent = photo.user?.name;

  cardBodyElement.append(cardTitleElement, cardDescriptionElement);
  cardContainerElement.append(imageElement, cardBodyElement);

  return cardContainerElement;
}

function setAttributesOfDomNode(domNode, attributes) {
  for (let attributeName in attributes) {
    domNode.setAttribute(attributeName, attributes[attributeName]);
  }
}

function getSystemTheme() {
  let isDarkMode = false;
  if (window?.matchMedia("(prefers-color-scheme: dark)")?.matches) {
    isDarkMode = true;
  }
  setTheme(isDarkMode);
}

function setTheme(isDarkMode) {
  const themeLabel = isDarkMode ? "dark" : "light";
  document.documentElement.setAttribute("data-theme", themeLabel);
  themeLabelElement.textContent = CONSTANTS.themeLabels[themeLabel];
  const iconClass = isDarkMode ? "far fa-moon" : "far fa-sun";
  themeIconElement.setAttribute("class", iconClass);
  themeCheckboxElement.checked = isDarkMode;
}

function onThemeChange(e) {
  setTheme(e.target.checked);
}

function observeIntersection() {
  const options = {
    root: null,
    rootMargin: "0px",
    threshold: 1,
  };
  const intersectionObserver = new IntersectionObserver(
    intersetionCallback,
    options
  );
  return intersectionObserver;
}

function intersetionCallback(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const target = entry.target;
      target.src = target.dataset.src;
      target.classList.remove("img-lazy");
      imageIntersectionObserver.unobserve(target);
    }
  });
}

// On load

fetchImages();

getSystemTheme();
