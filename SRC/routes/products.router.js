const express = require("express");
const router = express.Router();
const ProductManager = require("../managers/ProductManager");

// Instancia del manejador de productos
const productManager = new ProductManager("./src/data/products.json");

// GET /api/products/ - Obtener todos los productos
router.get("/", async (req, res) => {
  const products = await productManager.getProducts();
  res.json(products);
});

// GET /api/products/:pid - Obtener producto por ID
router.get("/:pid", async (req, res) => {
  const id = req.params.pid;
  const product = await productManager.getProductById(id);
  if (!product) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json(product);
});

// POST /api/products/ - Agregar nuevo producto
router.post("/", async (req, res) => {
  const productData = req.body;
  try {
    const newProduct = await productManager.addProduct(productData);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:pid - Actualizar producto por ID
router.put("/:pid", async (req, res) => {
  const id = req.params.pid;
  const updates = req.body;
  try {
    const updatedProduct = await productManager.updateProduct(id, updates);
    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar producto por ID
router.delete("/:pid", async (req, res) => {
  const id = req.params.pid;
  const deleted = await productManager.deleteProduct(id);
  if (!deleted) {
    return res.status(404).json({ error: "Producto no encontrado" });
  }
  res.json({ message: "Producto eliminado correctamente" });
});

module.exports = router;
