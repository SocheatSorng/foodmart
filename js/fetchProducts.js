const CORS_PROXY = "https://api.allorigins.win/raw?url=";
const API_URL = "https://fakestoreapi.com/products";

// Function to retry fetch with different methods
async function fetchWithFallback(url) {
  const methods = [
    // Try direct fetch first
    () =>
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }),
    // Try CORS proxy
    () => fetch(`${CORS_PROXY}${encodeURIComponent(url)}`),
    // Try another CORS proxy
    () => fetch(`https://cors-anywhere.herokuapp.com/${url}`),
    // Try with no-cors mode
    () => fetch(url, { mode: "no-cors" }),
  ];

  for (const method of methods) {
    try {
      const response = await method();
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn("Fetch attempt failed, trying next method:", error);
    }
  }

  // If all fetch attempts fail, return fallback data
  console.warn("All fetch attempts failed, using fallback data");
  return getFallbackData();
}

function getFallbackData() {
  return {
    products: [
      {
        id: 1,
        title: "Organic Mixed Vegetables Pack",
        price: 12.99,
        description: "Fresh assorted organic vegetables",
        category: "vegetables",
        image: "images/products/vegetables-1.jpg",
        rating: { rate: 4.5, count: 89 },
      },
      {
        id: 2,
        title: "Fresh Fruit Basket",
        price: 24.99,
        description: "Seasonal fresh fruits selection",
        category: "fruits",
        image: "images/products/fruits-1.jpg",
        rating: { rate: 4.8, count: 112 },
      },
      {
        id: 3,
        title: "Organic Milk",
        price: 4.99,
        description: "Fresh organic whole milk",
        category: "dairy",
        image: "images/products/dairy-1.jpg",
        rating: { rate: 4.3, count: 78 },
      },
      {
        id: 4,
        title: "Whole Grain Bread",
        price: 3.99,
        description: "Freshly baked whole grain bread",
        category: "bakery",
        image: "images/products/bakery-1.jpg",
        rating: { rate: 4.6, count: 145 },
      },
      {
        id: 5,
        title: "Free Range Eggs",
        price: 5.99,
        description: "Farm fresh free-range eggs",
        category: "dairy",
        image: "images/products/dairy-2.jpg",
        rating: { rate: 4.7, count: 68 },
      },
    ],
    categories: ["vegetables", "fruits", "dairy", "bakery", "beverages"],
  };
}

async function fetchProducts() {
  try {
    const data = await fetchWithFallback(API_URL);
    return Array.isArray(data) ? data : getFallbackData().products;
  } catch (error) {
    console.error("Error fetching products:", error);
    return getFallbackData().products;
  }
}

async function fetchCategories() {
  try {
    const products = await fetchProducts();
    const categories = [
      ...new Set(products.map((product) => product.category)),
    ];
    return categories.length > 0 ? categories : getFallbackData().categories;
  } catch (error) {
    console.error("Error fetching categories:", error);
    return getFallbackData().categories;
  }
}

async function fetchProductsByCategory(category) {
  try {
    const products = await fetchProducts();
    return products.filter((product) => product.category === category);
  } catch (error) {
    console.error("Error fetching products by category:", error);
    return getFallbackData().products.filter(
      (product) => product.category === category
    );
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
