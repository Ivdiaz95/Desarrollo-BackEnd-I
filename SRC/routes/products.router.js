import { Router } from "express";
import { productModel } from "../models/products.js";

const router = Router();

// GET /api/products/ - Obtener todos los productos con paginación, filtros y ordenamiento
router.get("/", async (req, res) => {
  // Extraer los parámetros de la URL
  const { limit = 10, page = 1, sort, query } = req.query;

  // Configurar las opciones de paginación
  const options = {
    limit: parseInt(limit),
    page: parseInt(page),
    lean: true,
  };

  // Configurar el ordenamiento por precio si se especifica
  if (sort === "asc" || sort === "desc") {
    options.sort = { price: sort === "asc" ? 1 : -1 };
  }

  // Construir el filtro para la búsqueda por 'category' o 'disponibility'
  const filter = {};
  if (query) {
    filter.$or = [
      { category: query },
      { status: query }, // Asumiendo que 'status' representa la disponibilidad
    ];
  }

  try {
    const products = await productModel.paginate(filter, options);

    // Calcular los enlaces de paginación
    const baseUrl = `${req.protocol}://${req.get("host")}${req.baseUrl}`;

    const prevLink = products.hasPrevPage
      ? `${baseUrl}?page=${products.prevPage}&limit=${limit}&query=${
          query || ""
        }&sort=${sort || ""}`
      : null;
    const nextLink = products.hasNextPage
      ? `${baseUrl}?page=${products.nextPage}&limit=${limit}&query=${
          query || ""
        }&sort=${sort || ""}`
      : null;

    // Formatear la respuesta
    const response = {
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.prevPage,
      nextPage: products.nextPage,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink,
      nextLink,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({
      status: "error",
      payload: "Error interno del servidor",
    });
  }
});

// GET /api/products/:pid - Obtener producto por ID (Tu código original)
router.get("/:pid", async (req, res) => {
  try {
    const product = await productModel.findById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Error al buscar el producto" });
  }
});

// POST /api/products/ - Agregar nuevo producto (Tu código original)
router.post("/", async (req, res) => {
  try {
    const newProduct = new productModel(req.body);
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/products/:pid - Actualizar producto por ID (Tu código original)
router.put("/:pid", async (req, res) => {
  try {
    const updatedProduct = await productModel.findByIdAndUpdate(
      req.params.pid,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json(updatedProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/products/:pid - Eliminar producto por ID (Tu código original)
router.delete("/:pid", async (req, res) => {
  try {
    const deletedProduct = await productModel.findByIdAndDelete(req.params.pid);
    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }
    res.json({ message: "Producto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: "Error al eliminar el producto" });
  }
});

export default router;
