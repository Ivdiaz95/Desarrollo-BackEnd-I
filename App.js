const express = require("express");
const { engine } = require("express-handlebars");
const { Server: HttpServer } = require("http");
const { Server: IOServer } = require("socket.io");
const path = require("path");

// Importaciones
const productsRouter = require("./SRC/routes/products.router");
const cartsRouter = require("./SRC/routes/carts.router");
const viewsRouter = require("./SRC/routes/views.router");
const ProductManager = require("./SRC/managers/ProductManager");

const app = express();
const httpServer = new HttpServer(app);

const io = new IOServer(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
const PORT = 8080;
// ===============================================
// Configuración de Handlebars
// ===============================================
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "/SRC/views"));

// ===============================================
// Middlewares
// ===============================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  req.io = io;
  next();
});

// ===============================================
// Rutas
// ===============================================
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// ===============================================
// Lógica de Websockets (Server-side)
// ===============================================
// La ruta del archivo de datos es ahora desde la raíz
const productManager = new ProductManager("products.json");

io.on("connection", async (socket) => {
  console.log("Nuevo cliente conectado.");

  const products = await productManager.getProducts();
  socket.emit("products-update", products);

  socket.on("new-product", async (newProductData) => {
    try {
      await productManager.addProduct(newProductData);
      const updatedProducts = await productManager.getProducts();
      io.emit("products-update", updatedProducts);
    } catch (error) {
      console.error("Error al agregar un producto:", error.message);
    }
  });

  socket.on("delete-product", async (productId) => {
    try {
      await productManager.deleteProduct(productId);
      const updatedProducts = await productManager.getProducts();
      io.emit("products-update", updatedProducts);
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error.message);
    }
  });
});
// Iniciar el servidor
httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
