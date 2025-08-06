const fs = require("fs").promises;
const path = require("path");

class CartManager {
  constructor(filePath) {
    this.filePath = path.resolve(filePath);
  }

  // Leer carritos
  async getCarts() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Obtener carrito por ID
  async getCartById(id) {
    const carts = await this.getCarts();
    return carts.find((cart) => String(cart.id) === String(id));
  }

  // Crear nuevo carrito
  async createCart() {
    const carts = await this.getCarts();
    const newId =
      carts.length > 0 ? Math.max(...carts.map((c) => parseInt(c.id))) + 1 : 1;

    const newCart = {
      id: newId,
      products: [],
    };

    carts.push(newCart);
    await this.saveCarts(carts);
    return newCart;
  }

  // Agregar producto al carrito
  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts();
    const cart = carts.find((c) => String(c.id) === String(cartId));
    if (!cart) return null;

    const existingProduct = cart.products.find(
      (p) => String(p.product) === String(productId)
    );

    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    await this.saveCarts(carts);
    return cart;
  }

  // Guardar carritos
  async saveCarts(carts) {
    await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
  }
}

module.exports = CartManager;
