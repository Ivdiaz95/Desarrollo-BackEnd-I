const socket = io();

// Función para renderizar la lista de productos
function renderProducts(products) {
  const productsList = document.getElementById("products-list");
  productsList.innerHTML = ""; // Limpiar la lista antes de renderizar

  products.forEach((product) => {
    const productCard = document.createElement("div");
    productCard.className = "product-card";
    // Usamos product._id para el identificador único de MongoDB
    productCard.innerHTML = `
      <div class="product-info">
        <strong>ID: ${product._id} - ${product.title}</strong>
        <p>Descripción: ${product.description}</p>
        <p>Precio: $${product.price}</p>
        <p>Stock: ${product.stock}</p>
      </div>
      <button class="delete-btn" data-id="${product._id}">Eliminar</button>
    `;
    productsList.appendChild(productCard);

    // Agregar el listener para el botón de eliminar
    const deleteButton = productCard.querySelector(".delete-btn");
    deleteButton.addEventListener("click", () => {
      const productId = deleteButton.getAttribute("data-id");
      // Enviamos el _id de MongoDB para eliminar el producto
      socket.emit("delete-product", productId);
    });
  });
}

// Escuchar el evento de actualización de productos desde el servidor
socket.on("products-update", (products) => {
  console.log("Productos actualizados recibidos:", products);
  renderProducts(products);
});

// Manejar el envío del formulario
const productForm = document.getElementById("product-form");
if (productForm) {
  productForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(productForm);
    const newProduct = {
      title: formData.get("title"),
      description: formData.get("description"),
      code: formData.get("code"),
      price: parseFloat(formData.get("price")),
      stock: parseInt(formData.get("stock")),
      category: formData.get("category"),
      // Convertimos el string del select a un booleano
      status: formData.get("status") === "true",
      thumbnails: [],
    };

    // Emitir el nuevo producto al servidor
    socket.emit("new-product", newProduct);

    // Limpiar el formulario
    productForm.reset();
  });
} else {
  console.error('No se encontró el formulario con el ID "product-form".');
}
