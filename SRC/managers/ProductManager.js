import { promises as fs } from "fs";
import path from "path";
// Importamos 'fileURLToPath' para convertir la URL del módulo a una ruta de archivo.
import { fileURLToPath } from "url";

// En ES Modules, 'import.meta.url' contiene la URL del archivo actual.
// Usamos 'fileURLToPath' y 'path.dirname' para obtener el equivalente a '__dirname'.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ProductManager {
  constructor(filePath) {
    // Usamos el '__dirname' recién creado para resolver la ruta del archivo.
    this.filePath = path.resolve(__dirname, "..", "data", filePath);
  }

  // Leer todos los productos
  async getProducts() {
    try {
      const data = await fs.readFile(this.filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      return []; // Si no existe o está vacío, devolvemos array vacío
    }
  }

  // Buscar producto por ID
  async getProductById(id) {
    const products = await this.getProducts();
    return products.find((p) => String(p.id) === String(id));
  }

  // Agregar un nuevo producto
  async addProduct(productData) {
    const products = await this.getProducts();

    const requiredFields = [
      "title",
      "description",
      "code",
      "price",
      "status",
      "stock",
      "category",
      "thumbnails",
    ];
    const missingFields = requiredFields.filter(
      (field) => !(field in productData)
    );
    if (missingFields.length > 0) {
      throw new Error(
        `Faltan campos obligatorios: ${missingFields.join(", ")}`
      );
    }

    // Generar ID único
    const newId =
      products.length > 0
        ? Math.max(...products.map((p) => parseInt(p.id))) + 1
        : 1;

    const newProduct = {
      id: newId,
      ...productData,
    };

    products.push(newProduct);
    await this.saveProducts(products);

    return newProduct;
  }

  // Actualizar producto
  async updateProduct(id, updates) {
    const products = await this.getProducts();
    const index = products.findIndex((p) => String(p.id) === String(id));

    if (index === -1) return null;

    if ("id" in updates) {
      delete updates.id; // No se permite actualizar el ID
    }

    products[index] = {
      ...products[index],
      ...updates,
    };

    await this.saveProducts(products);
    return products[index];
  }

  // Eliminar producto
  async deleteProduct(id) {
    const products = await this.getProducts();
    const updatedProducts = products.filter((p) => String(p.id) !== String(id));
    if (products.length === updatedProducts.length) return false; // No se eliminó nada

    await this.saveProducts(updatedProducts);
    return true;
  }

  // Guardar productos en el archivo
  async saveProducts(products) {
    await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
  }
}

export default ProductManager;
