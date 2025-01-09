const BASE_URL = "https://fakestoreapi.com/products";

async function fetchProducts() {
  try {
    // First try to get data from localStorage
    const cachedData = localStorage.getItem("cachedProducts");
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If no cached data, fetch from API
    const response = await fetch(BASE_URL, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      mode: "cors", // This is important for CORS
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    // Cache the data in localStorage
    localStorage.setItem("cachedProducts", JSON.stringify(products));

    return products;
  } catch (error) {
    console.error("Error fetching products:", error);

    // Fallback to cached data if available
    const cachedData = localStorage.getItem("cachedProducts");
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    // If all else fails, return empty array
    return [];
  }
}

async function fetchCategories() {
  try {
    // First try to get data from localStorage
    const cachedData = localStorage.getItem("cachedCategories");
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(
      `https://fakestoreapi.com/products/categories`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const categories = await response.json();

    // Cache the data
    localStorage.setItem("cachedCategories", JSON.stringify(categories));

    return categories;
  } catch (error) {
    console.error("Error fetching categories:", error);

    // Fallback to cached data
    const cachedData = localStorage.getItem("cachedCategories");
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    return [];
  }
}

async function fetchProductsByCategory(category) {
  try {
    // Try cache first
    const cachedData = localStorage.getItem(`category_${category}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    const response = await fetch(
      `https://fakestoreapi.com/products/category/${category}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        mode: "cors",
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const products = await response.json();

    // Cache the category data
    localStorage.setItem(`category_${category}`, JSON.stringify(products));

    return products;
  } catch (error) {
    console.error("Error fetching products by category:", error);

    // Fallback to cached data
    const cachedData = localStorage.getItem(`category_${category}`);
    if (cachedData) {
      return JSON.parse(cachedData);
    }

    return [];
  }
}

async function replaceImages() {
  const products = await fetchProducts();
  const productImages = document.querySelectorAll("[data-product-image]");

  productImages.forEach((imgElement, index) => {
    if (products[index]) {
      const imageContainer = imgElement.closest(".img-wrapper");
      const titleElement = imageContainer
        .closest(".banner-content")
        ?.querySelector(".banner-title");
      const descElement = imageContainer
        .closest(".banner-content")
        ?.querySelector("p");

      // Update image
      imgElement.src = products[index].image;
      imgElement.alt = products[index].title;

      // Update title and description if they exist
      if (titleElement) {
        titleElement.textContent = products[index].title;
      }
      if (descElement) {
        descElement.textContent = products[index].description;
      }
    }
  });
}

async function updateCategoryBlocks() {
  const categoryContainer = document.querySelector(".category-blocks");
  // Add this check
  if (!categoryContainer) return; // Skip if container not found

  const categories = await fetchCategories();

  for (let i = 0; i < categories.length && i < 4; i++) {
    const products = await fetchProductsByCategory(categories[i]);
    if (products.length > 0 && categoryContainer.children[i]) {
      const block = categoryContainer.children[i];
      const image = products[0].image;
      const title = categories[i].replace("'", "").toUpperCase();

      // Update background image and content
      block.style.backgroundImage = `url(${image})`;
      const titleEl = block.querySelector(".banner-title");
      const categoriesEl = block.querySelector(".categories");

      if (titleEl) titleEl.textContent = title;
      if (categoriesEl)
        categoriesEl.textContent = `${products.length} Products`;
    }
  }
}

async function updateMainBanner() {
  const products = await fetchProducts();
  if (products.length === 0) return;

  const mainSlides = document.querySelectorAll(".main-swiper .swiper-slide");
  mainSlides.forEach((slide, index) => {
    if (products[index]) {
      const product = products[index];
      const titleElement = slide.querySelector(".banner-title, h3");
      const descElement = slide.querySelector("p");
      const imgElement = slide.querySelector("img[data-product-image]");

      if (titleElement) titleElement.textContent = product.title;
      if (descElement) descElement.textContent = product.description;
      if (imgElement) {
        imgElement.src = product.image;
        imgElement.alt = product.title;
      }
    }
  });
}

async function updatePromotionalBanners() {
  const categories = await fetchCategories();
  const bannerBlocks = [
    { selector: ".block-2", discount: "20% off" },
    { selector: ".block-3", discount: "15% off" },
  ];

  for (let i = 0; i < bannerBlocks.length; i++) {
    if (categories[i]) {
      const block = document.querySelector(bannerBlocks[i].selector);
      if (!block) continue;

      const products = await fetchProductsByCategory(categories[i]);
      if (products.length === 0) continue;

      const categoryTitle =
        categories[i].charAt(0).toUpperCase() + categories[i].slice(1);
      const saleElement = block.querySelector(".categories.sale");
      const titleElement = block.querySelector(".banner-title, .item-title");

      if (saleElement) saleElement.textContent = bannerBlocks[i].discount;
      if (titleElement) titleElement.textContent = categoryTitle;

      // Update background if it exists
      block.style.backgroundImage = `url(${products[0].image})`;
    }
  }
}

async function updateSpecialOffer() {
  const products = await fetchProducts();
  if (products.length === 0) return;

  const specialOffer = document.querySelector(
    ".banner-ad.bg-info:not(.block-1)"
  );
  if (!specialOffer) return;

  const randomProduct = products[Math.floor(Math.random() * products.length)];
  const titleElement = specialOffer.querySelector(".banner-title");
  const descElement = specialOffer.querySelector("p");

  if (titleElement) titleElement.textContent = randomProduct.title;
  if (descElement) descElement.textContent = randomProduct.description;
  specialOffer.style.backgroundImage = `url(${randomProduct.image})`;
}

// Run when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  updateMainBanner();
  updatePromotionalBanners();
  updateSpecialOffer();
  updateCategoryBlocks();
});
