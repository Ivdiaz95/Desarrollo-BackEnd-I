import express from "express";
import { engine } from "express-handlebars";
import { Server as HttpServer } from "http";
import { Server as IOServer } from "socket.io";
import mongoose from "mongoose";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

// Importación de routers usando ES Modules
import productsRouter from "./routes/products.router.js";
import cartsRouter from "./routes/carts.router.js";
import { viewsRouter } from "./routes/views.router.js";

// Importa el modelo de producto.
import { productModel } from "./models/products.js";

// Configuración para usar __dirname con ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ===============================================
// Cargar las variables de entorno
// CORRECCIÓN: Se indica la ruta explícita al archivo .env
// ===============================================
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

const app = express();
const httpServer = new HttpServer(app);
const io = new IOServer(httpServer);
const PORT = process.env.PORT || 8080;
const MONGODB_URI = process.env.MONGODB_URI;

// ===============================================
// Conexión a Mongoose
// ===============================================
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("Conectado a la base de datos de MongoDB");
  })
  .catch((err) => {
    console.error("Error al conectar a la base de datos:", err);
  });

// ===============================================
// Configuración de Handlebars
// ===============================================
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/views"));

// ===============================================
// Middlewares
// ===============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "../public")));

// ===============================================
// Rutas
// ===============================================
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// ===============================================
// Lógica de Websockets (Server-side)
// ===============================================
io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado.");

  const sendProducts = async () => {
    try {
      // CORRECCIÓN: Usa productModel (minúscula)
      const products = await productModel.find().lean();
      io.emit("products-update", products);
    } catch (error) {
      console.error("Error al obtener y enviar productos:", error);
    }
  };
  await sendProducts();

  socket.on("new-product", async (productData) => {
    try {
      // CORRECCIÓN: Usa productModel (minúscula)
      const newProduct = new productModel(productData);
      await newProduct.save();
      await sendProducts();
    } catch (error) {
      console.error("Error al agregar el producto:", error);
    }
  });

  socket.on("delete-product", async (productId) => {
    try {
      // CORRECCIÓN: Usa productModel (minúscula)
      await productModel.findByIdAndDelete(productId);
      await sendProducts();
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
    }
  });
});

// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en el http://localhost:${PORT}`);
});
