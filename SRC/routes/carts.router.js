const { Router } = require("express");
const CartManager = require("../managers/CartManager");
const ProductManager = require("../managers/ProductManager");

const cartsRouter = Router();
const cartManager = new CartManager("../data/carts.json");
const productManager = new ProductManager("../data/products.json");

// Ruta para crear un nuevo carrito
cartsRouter.post("/", async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: "Error al crear el carrito." });
  }
});

// Ruta para obtener un carrito por ID
cartsRouter.get("/:cid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.getCartById(cartId);
    if (!cart) {
      return res.status(404).json({ error: "Carrito no encontrado." });
    }
    res.status(200).json(cart.products);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el carrito." });
  }
});

// Ruta para agregar un producto a un carrito
cartsRouter.post("/:cid/products/:pid", async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;

    // Verificar que el producto existe antes de agregarlo al carrito
    const productExists = await productManager.getProductById(productId);
    if (!productExists) {
      return res.status(404).json({ error: "El producto no existe." });
    }

    const updatedCart = await cartManager.addProductToCart(cartId, productId);
    if (!updatedCart) {
      return res.status(404).json({ error: "Carrito no encontrado." });
    }
    res.status(200).json(updatedCart);
  } catch (error) {
    res.status(500).json({ error: "Error al agregar el producto al carrito." });
  }
});

module.exports = cartsRouter;
