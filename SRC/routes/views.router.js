const { Router } = require("express");
const ProductManager = require("../managers/ProductManager");

const viewsRouter = Router();
const productManager = new ProductManager("../../products.json");

// Ruta para la vista "home.handlebars"
viewsRouter.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    // Aquí es donde está el cambio: se renderiza 'realTimeProducts'
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send("Error al obtener los productos para la vista.");
  }
});

// Ruta para la vista "realTimeProducts.handlebars"
viewsRouter.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res
      .status(500)
      .send("Error al obtener los productos para la vista en tiempo real.");
  }
});

module.exports = viewsRouter;
