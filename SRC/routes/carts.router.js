import { Router } from "express";
import cartModel from "../models/carts.js";
import { productModel } from "../models/products.js";

const router = Router();

// =================================================================
// POST /api/carts - Crear un nuevo carrito
// =================================================================
router.post("/", async (req, res) => {
  try {
    const newCart = new cartModel();
    await newCart.save();
    res.status(201).json({
      message: "Carrito creado con éxito",
      cart: newCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al crear el carrito",
    });
  }
});

// =================================================================
// GET /api/carts/:cid - Obtener un carrito con todos los productos completos (populate)
// =================================================================
router.get("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel
      .findById(cid)
      .populate("products.product")
      .lean();

    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    res.status(200).json({
      message: "Carrito encontrado con éxito",
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al obtener el carrito",
    });
  }
});

// =================================================================
// POST /api/carts/:cid/products/:pid - Agregar un producto a un carrito
// =================================================================
router.post("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity = 1 } = req.body;

    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex !== -1) {
      cart.products[productIndex].quantity += quantity;
    } else {
      cart.products.push({ product: pid, quantity });
    }

    await cart.save();
    res.status(200).json({
      message: "Producto agregado al carrito con éxito",
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al agregar producto al carrito",
    });
  }
});

// =================================================================
// PUT /api/carts/:cid - Actualizar todos los productos del carrito
// =================================================================
router.put("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const { products } = req.body;

    const updatedCart = await cartModel.findByIdAndUpdate(
      cid,
      { products: products },
      { new: true }
    );

    if (!updatedCart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    res.status(200).json({
      message: "Carrito actualizado con éxito",
      cart: updatedCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar el carrito",
    });
  }
});

// =================================================================
// PUT /api/carts/:cid/products/:pid - Actualizar la cantidad de un producto
// =================================================================
router.put("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const { quantity } = req.body;

    if (typeof quantity !== "number" || quantity <= 0) {
      return res.status(400).json({
        message: "La cantidad debe ser un número positivo",
      });
    }

    const cart = await cartModel.findById(cid);
    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    const productIndex = cart.products.findIndex(
      (p) => p.product.toString() === pid
    );
    if (productIndex === -1) {
      return res.status(404).json({
        message: "Producto no encontrado en el carrito",
      });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.status(200).json({
      message: "Cantidad de producto actualizada con éxito",
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al actualizar la cantidad del producto",
    });
  }
});

// =================================================================
// DELETE /api/carts/:cid/products/:pid - Eliminar un producto del carrito
// =================================================================
router.delete("/:cid/products/:pid", async (req, res) => {
  try {
    const { cid, pid } = req.params;
    const cart = await cartModel.findById(cid);

    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    const initialProductCount = cart.products.length;
    cart.products = cart.products.filter((p) => p.product.toString() !== pid);

    if (cart.products.length === initialProductCount) {
      return res.status(404).json({
        message: "Producto no encontrado en el carrito",
      });
    }

    await cart.save();
    res.status(200).json({
      message: "Producto eliminado del carrito con éxito",
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el producto del carrito",
    });
  }
});

// =================================================================
// DELETE /api/carts/:cid - Eliminar todos los productos de un carrito (Vaciar)
// =================================================================
router.delete("/:cid", async (req, res) => {
  try {
    const { cid } = req.params;
    const cart = await cartModel.findByIdAndUpdate(
      cid,
      { products: [] },
      { new: true }
    );

    if (!cart) {
      return res.status(404).json({
        message: "Carrito no encontrado",
      });
    }

    res.status(200).json({
      message: "Todos los productos del carrito han sido eliminados",
      cart: cart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al vaciar el carrito",
    });
  }
});

export default router;
