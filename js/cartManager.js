class CartManager {
  constructor() {
    this.cart = JSON.parse(localStorage.getItem("cart")) || {};
    this.wishlist = JSON.parse(localStorage.getItem("wishlist")) || {};
    this.updateCartCount();
  }

  addToCart(productId, quantity = 1) {
    this.cart[productId] = (this.cart[productId] || 0) + quantity;
    this.saveCart();
    this.updateCartCount();
    return this.cart[productId];
  }

  removeFromCart(productId) {
    delete this.cart[productId];
    this.saveCart();
    this.updateCartCount();
  }

  updateCartQuantity(productId, quantity) {
    if (quantity <= 0) {
      this.removeFromCart(productId);
    } else {
      this.cart[productId] = quantity;
      this.saveCart();
      this.updateCartCount();
    }
  }

  toggleWishlist(productId) {
    if (this.wishlist[productId]) {
      delete this.wishlist[productId];
    } else {
      this.wishlist[productId] = true;
    }
    this.saveWishlist();
    return this.wishlist[productId] || false;
  }

  isInWishlist(productId) {
    return !!this.wishlist[productId];
  }

  saveCart() {
    localStorage.setItem("cart", JSON.stringify(this.cart));
    // Dispatch event when cart is updated
    document.dispatchEvent(new Event("cartUpdated"));
  }

  saveWishlist() {
    localStorage.setItem("wishlist", JSON.stringify(this.wishlist));
  }

  updateCartCount() {
    const count = Object.values(this.cart).reduce((a, b) => a + b, 0);
    document.querySelectorAll(".badge").forEach((badge) => {
      if (badge.closest('[data-bs-target="#offcanvasCart"]')) {
        badge.textContent = count;
      }
    });
  }

  clearCart() {
    this.cart = {};
    localStorage.setItem("cart", JSON.stringify(this.cart));
    document.dispatchEvent(new Event("cartUpdated"));
  }
}
