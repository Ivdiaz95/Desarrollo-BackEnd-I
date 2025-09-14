import { Router } from "express";
import ProductManager from "../managers/productmanager.js";

const viewsRouter = Router();
const productManager = new ProductManager("../../products.json");

// Esta ruta será ahora la página principal (localhost:8080)
viewsRouter.get("/", async (req, res) => {
  try {
    const products = await productManager.getProducts();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res
      .status(500)
      .send("Error al obtener los productos para la vista en tiempo real.");
  }
});

// Puedes mantener la ruta si el usuario la escribe explícitamente, aunque ahora es redundante.
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

export { viewsRouter };
