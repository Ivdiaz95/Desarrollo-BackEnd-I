const express = require("express");
const router = express.Router();
const CartManager = require("../managers/CartManager");

// Instancia del manejador de carritos
const cartManager = new CartManager("./src/data/carts.json");

// POST /api/carts/ - Crear nuevo carrito
router.post("/", async (req, res) => {
  const newCart = await cartManager.createCart();
  res.status(201).json(newCart);
});

// GET /api/carts/:cid - Obtener productos de un carrito
router.get("/:cid", async (req, res) => {
  const cartId = req.params.cid;
  const cart = await cartManager.getCartById(cartId);

  if (!cart) {
    return res.status(404).json({ error: "Carrito no encontrado" });
  }

  res.json(cart.products);
});

// POST /api/carts/:cid/product/:pid - Agregar producto a un carrito
router.post("/:cid/product/:pid", async (req, res) => {
  const cartId = req.params.cid;
  const productId = req.params.pid;

  try {
    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado" });
    }

    res.json(updatedCart);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
