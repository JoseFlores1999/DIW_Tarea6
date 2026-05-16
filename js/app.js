const raiz = document.documentElement;
const botonTema = document.querySelector("[data-boton-tema]");
const claveTema = "tema";
const claveCarrito = "carritoLibreriaJoseTema6";

const catalogoProductos = {
  nombre_viento: {
    id: "nombre_viento",
    titulo: "El nombre del viento",
    precio: 19.95,
    precioTexto: "19,95€",
    imagen: "assets/img/products/sm/nombre_viento.jpg"
  },
  "1984": {
    id: "1984",
    titulo: "1984",
    precio: 12.5,
    precioTexto: "12,50€",
    imagen: "assets/img/products/sm/1984.jpg"
  },
  dune: {
    id: "dune",
    titulo: "Dune",
    precio: 22,
    precioTexto: "22,00€",
    imagen: "assets/img/products/sm/dune.jpg"
  },
  got: {
    id: "got",
    titulo: "Juego de tronos",
    precio: 24.95,
    precioTexto: "24,95€",
    imagen: "assets/img/products/sm/got.jpg"
  }
};

window.catalogoProductos = catalogoProductos;

function aplicarTema(modo) {
  raiz.classList.toggle("tema-oscuro", modo === "oscuro");
  localStorage.setItem(claveTema, modo);
}

function iniciarTema() {
  const temaGuardado = localStorage.getItem(claveTema);

  if (temaGuardado) {
    aplicarTema(temaGuardado);
    return;
  }

  const prefiereOscuro =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  aplicarTema(prefiereOscuro ? "oscuro" : "claro");
}

function formatoPrecio(valor) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR"
  }).format(valor);
}

function leerCarrito() {
  const guardado = localStorage.getItem(claveCarrito);

  if (guardado === null) {
    return [];
  }

  try {
    const carrito = JSON.parse(guardado);
    return Array.isArray(carrito) ? carrito : [];
  } catch (error) {
    return [];
  }
}

function guardarCarrito(carrito) {
  localStorage.setItem(claveCarrito, JSON.stringify(carrito));
}

function totalCarrito(carrito) {
  return carrito.reduce((total, item) => {
    const producto = catalogoProductos[item.id];
    return producto ? total + producto.precio * item.cantidad : total;
  }, 0);
}

function contarUnidades(carrito) {
  return carrito.reduce((total, item) => total + item.cantidad, 0);
}

function actualizarContadorCarrito() {
  const carrito = leerCarrito();
  const unidades = contarUnidades(carrito);

  document.querySelectorAll(".cart-link").forEach((link) => {
    let contador = link.querySelector(".cart-count");

    if (!contador) {
      contador = document.createElement("span");
      contador.className = "cart-count";
      link.appendChild(contador);
    }

    contador.textContent = unidades;
    contador.hidden = unidades === 0;
  });
}

function mostrarNotificacion(texto, tipo = "success") {
  let zona = document.getElementById("zonaNotificaciones");

  if (!zona) {
    zona = document.createElement("div");
    zona.id = "zonaNotificaciones";
    zona.className = "zona-notificaciones";
    zona.setAttribute("aria-live", "polite");
    zona.setAttribute("aria-atomic", "true");
    document.body.appendChild(zona);
  }

  const aviso = document.createElement("div");
  aviso.className = `alert alert-${tipo} shadow-sm notificacion-web`;
  aviso.setAttribute("role", "status");
  aviso.textContent = texto;
  zona.appendChild(aviso);

  window.setTimeout(() => {
    aviso.remove();
  }, 2800);
}

function asegurarResumenCarrito() {
  if (document.getElementById("resumenCarrito")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="offcanvas offcanvas-end cart-offcanvas" tabindex="-1" id="resumenCarrito" aria-labelledby="resumenCarritoTitulo">
      <div class="offcanvas-header">
        <h2 class="offcanvas-title h5" id="resumenCarritoTitulo">Resumen del carrito</h2>
        <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Cerrar"></button>
      </div>
      <div class="offcanvas-body">
        <div id="resumenCarritoLista"></div>
        <div class="cart-summary-total mt-3">
          <span>Total</span>
          <strong id="resumenCarritoTotal">0,00 €</strong>
        </div>
        <div class="d-grid gap-2 mt-3">
          <a class="btn btn-primary" href="carrito.html">Ver carrito</a>
          <a class="btn btn-outline-primary" href="busqueda.html">Seguir buscando</a>
        </div>
      </div>
    </div>
  `);
}

function renderResumenCarrito() {
  asegurarResumenCarrito();

  const carrito = leerCarrito();
  const lista = document.getElementById("resumenCarritoLista");
  const total = document.getElementById("resumenCarritoTotal");

  if (!lista || !total) return;

  if (carrito.length === 0) {
    lista.innerHTML = '<p class="text-muted mb-0">El carrito está vacío.</p>';
  } else {
    lista.innerHTML = carrito.map((item) => {
      const producto = catalogoProductos[item.id];
      if (!producto) return "";

      return `
        <div class="cart-summary-item">
          <img src="${producto.imagen}" alt="Portada de ${producto.titulo}">
          <div>
            <strong>${producto.titulo}</strong>
            <span>${item.cantidad} × ${producto.precioTexto}</span>
          </div>
        </div>
      `;
    }).join("");
  }

  total.textContent = formatoPrecio(totalCarrito(carrito));
  actualizarContadorCarrito();
}

function abrirResumenCarrito() {
  renderResumenCarrito();

  const panel = document.getElementById("resumenCarrito");
  if (!panel || typeof bootstrap === "undefined") return;

  bootstrap.Offcanvas.getOrCreateInstance(panel).show();
}

function agregarProducto(id) {
  const producto = catalogoProductos[id];
  if (!producto) return;

  const carrito = leerCarrito();
  const item = carrito.find((entrada) => entrada.id === id);

  if (item) {
    item.cantidad += 1;
  } else {
    carrito.push({ id, cantidad: 1 });
  }

  guardarCarrito(carrito);
  renderCarritoPagina();
  renderResumenCarrito();
  mostrarNotificacion(`${producto.titulo} añadido al carrito.`);
}

function cambiarCantidad(id, cambio) {
  const carrito = leerCarrito();
  const item = carrito.find((entrada) => entrada.id === id);

  if (!item) return;

  item.cantidad += cambio;

  if (item.cantidad <= 0) {
    pedirConfirmacionEliminar(id);
    return;
  }

  guardarCarrito(carrito);
  renderCarritoPagina();
  renderResumenCarrito();
}

let productoPendienteEliminar = null;

function asegurarModalEliminar() {
  if (document.getElementById("modalEliminarProducto")) return;

  document.body.insertAdjacentHTML("beforeend", `
    <div class="modal fade" id="modalEliminarProducto" tabindex="-1" aria-labelledby="modalEliminarProductoTitulo" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h2 class="modal-title h5" id="modalEliminarProductoTitulo">Eliminar producto</h2>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div class="modal-body">
            ¿Quieres eliminar este producto del carrito?
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-danger" id="confirmarEliminarProducto">Eliminar</button>
          </div>
        </div>
      </div>
    </div>
  `);
}

function pedirConfirmacionEliminar(id) {
  productoPendienteEliminar = id;
  asegurarModalEliminar();

  const modal = document.getElementById("modalEliminarProducto");
  if (!modal || typeof bootstrap === "undefined") return;

  bootstrap.Modal.getOrCreateInstance(modal).show();
}

function eliminarProductoConfirmado() {
  if (!productoPendienteEliminar) return;

  const carrito = leerCarrito().filter((item) => item.id !== productoPendienteEliminar);
  const producto = catalogoProductos[productoPendienteEliminar];

  guardarCarrito(carrito);
  productoPendienteEliminar = null;

  const modal = document.getElementById("modalEliminarProducto");
  if (modal && typeof bootstrap !== "undefined") {
    bootstrap.Modal.getOrCreateInstance(modal).hide();
  }

  renderCarritoPagina();
  renderResumenCarrito();
  mostrarNotificacion(producto ? `${producto.titulo} eliminado.` : "Producto eliminado.", "warning");
}

function renderCarritoPagina() {
  const contenedor = document.getElementById("carritoContenido");
  if (!contenedor) return;

  const carrito = leerCarrito();

  if (carrito.length === 0) {
    contenedor.innerHTML = `
      <div class="card p-4">
        <p class="mb-3">El carrito está vacío.</p>
        <a class="btn btn-primary" href="busqueda.html">Buscar libros</a>
      </div>
    `;
    return;
  }

  const filas = carrito.map((item) => {
    const producto = catalogoProductos[item.id];
    if (!producto) return "";

    const subtotal = producto.precio * item.cantidad;

    return `
      <article class="cart-item" data-cart-row="${item.id}">
        <img class="cart-cover-img" src="${producto.imagen}" alt="Portada de ${producto.titulo}">

        <div class="cart-info">
          <h2 class="h5 mb-1">${producto.titulo}</h2>
          <p class="price mb-2">${producto.precioTexto}</p>

          <div class="cart-qty" aria-label="Cantidad de ${producto.titulo}">
            <button class="boton-icono" type="button" data-cart-action="restar" data-product-id="${item.id}" aria-label="Quitar una unidad">
              <span class="cart-minus-icon" aria-hidden="true">−</span>
            </button>
            <span class="cart-qty-value">${item.cantidad}</span>
            <button class="boton-icono" type="button" data-cart-action="sumar" data-product-id="${item.id}" aria-label="Añadir una unidad">
              <img class="icon" src="assets/img/icons/add.svg" alt="" aria-hidden="true" width="18" height="18">
            </button>
            <button class="boton-icono ms-2" type="button" data-cart-action="eliminar" data-product-id="${item.id}" aria-label="Eliminar producto">
              <img class="icon" src="assets/img/icons/delete.svg" alt="" aria-hidden="true" width="18" height="18">
            </button>
          </div>
        </div>

        <strong class="cart-subtotal">${formatoPrecio(subtotal)}</strong>
      </article>
    `;
  }).join("");

  contenedor.innerHTML = `
    <div class="card p-3 cart-card">
      ${filas}
      <hr>
      <div class="d-flex justify-content-between align-items-center">
        <strong>Total</strong>
        <strong>${formatoPrecio(totalCarrito(carrito))}</strong>
      </div>
      <div class="mt-3 d-flex flex-wrap gap-2">
        <a class="btn btn-outline-primary" href="busqueda.html">Seguir buscando</a>
        <button class="btn btn-primary" type="button" data-finalizar-compra>Finalizar compra</button>
      </div>
    </div>
  `;
}

function crearBotonSubir() {
  if (document.querySelector("[data-scroll-top]")) return;

  const boton = document.createElement("button");
  boton.className = "boton-subir";
  boton.type = "button";
  boton.setAttribute("data-scroll-top", "");
  boton.setAttribute("aria-label", "Subir al inicio");
  boton.title = "Subir al inicio (Alt + U)";
  boton.innerHTML = '<i class="bi bi-arrow-up" aria-hidden="true"></i>';
  document.body.appendChild(boton);
}

function actualizarBotonSubir() {
  const boton = document.querySelector("[data-scroll-top]");
  if (!boton) return;

  boton.classList.toggle("is-visible", window.scrollY > 120);
}

function subirAlInicio() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function ajustarBannerResponsive() {
  const wrap = document.querySelector(".banner-gwd-wrap");
  const frame = document.querySelector(".banner-gwd-frame");

  if (!wrap || !frame) return;

  const anchoOriginal = 728;
  const altoOriginal = 90;
  const anchoDisponible = wrap.clientWidth;
  const escala = Math.min(anchoDisponible / anchoOriginal, 1);

  frame.style.transform = `scale(${escala})`;
  wrap.style.height = `${altoOriginal * escala}px`;
}

function activarAnimacionesScroll() {
  const elementos = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window)) {
    elementos.forEach((elemento) => elemento.classList.add("reveal-visible"));
    return;
  }

  const observador = new IntersectionObserver((entradas, obs) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("reveal-visible");
        obs.unobserve(entrada.target);
      }
    });
  }, {
    threshold: 0.15
  });

  elementos.forEach((elemento) => observador.observe(elemento));
}

function crearGraficoLibreria() {
  const canvas = document.getElementById("graficoLibreria");
  if (!canvas || typeof Chart === "undefined") return;

  const reducirMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const datasets = {
    ventas: {
      etiqueta: "Ventas semanales",
      etiquetas: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
      valores: [12, 19, 15, 22, 28, 24]
    },
    generos: {
      etiqueta: "Géneros destacados",
      etiquetas: ["Novela", "Fantasía", "Historia", "Poesía", "Infantil", "Ciencia ficción"],
      valores: [18, 25, 11, 9, 14, 20]
    }
  };

  const grafico = new Chart(canvas.getContext("2d"), {
    type: "bar",
    data: {
      labels: datasets.ventas.etiquetas,
      datasets: [{
        label: datasets.ventas.etiqueta,
        data: datasets.ventas.valores,
        borderWidth: 1,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: reducirMovimiento ? false : { duration: 1200 },
      plugins: { legend: { display: true } },
      scales: { y: { beginAtZero: true } }
    }
  });

  document.querySelectorAll(".chart-filter").forEach((boton) => {
    boton.addEventListener("click", () => {
      const datos = datasets[boton.dataset.chart];
      if (!datos) return;

      grafico.data.labels = datos.etiquetas;
      grafico.data.datasets[0].label = datos.etiqueta;
      grafico.data.datasets[0].data = datos.valores;
      grafico.update();

      document.querySelectorAll(".chart-filter").forEach((item) => item.classList.remove("is-active"));
      boton.classList.add("is-active");
    });
  });
}

function iniciarZoomImagenes() {
  const modalEl = document.getElementById("modalImagen");
  const targetImg = document.getElementById("imgModalObjetivo");
  if (!modalEl || !targetImg || typeof bootstrap === "undefined") return;

  const modal = new bootstrap.Modal(modalEl);

  document.addEventListener("click", (ev) => {
    const link = ev.target.closest("[data-zoom]");
    if (!link) return;

    ev.preventDefault();
    const src = link.getAttribute("data-img-grande");
    if (!src) return;

    targetImg.src = src;
    modal.show();
  });
}

function iniciarLeerMas() {
  document.querySelectorAll("[data-readmore-toggle]").forEach((boton) => {
    boton.addEventListener("click", () => {
      const bloque = boton.closest(".tab-pane") || document;
      const texto = bloque.querySelector("[data-readmore-text]");
      if (!texto) return;

      const oculto = texto.hasAttribute("hidden");
      texto.toggleAttribute("hidden", !oculto);
      boton.textContent = oculto ? "Leer menos" : "Leer más";
    });
  });
}

function iniciarValoracion() {
  const botones = document.querySelectorAll("[data-rating-value]");
  const mensaje = document.querySelector("[data-rating-message]");

  botones.forEach((boton) => {
    boton.addEventListener("click", () => {
      const valor = Number(boton.dataset.ratingValue);

      botones.forEach((item) => {
        item.classList.toggle("is-active", Number(item.dataset.ratingValue) <= valor);
      });

      if (mensaje) {
        mensaje.textContent = `Valoración seleccionada: ${valor} de 5`;
      }
    });
  });
}

function iniciarEventos() {
  botonTema?.addEventListener("click", () => {
    const estaOscuro = raiz.classList.contains("tema-oscuro");
    aplicarTema(estaOscuro ? "claro" : "oscuro");
  });

  document.addEventListener("click", (ev) => {
    const cartLink = ev.target.closest(".cart-link");
    if (cartLink) {
      ev.preventDefault();
      abrirResumenCarrito();
      return;
    }

    const addBtn = ev.target.closest("[data-add-cart]");
    if (addBtn) {
      ev.preventDefault();
      const id = addBtn.dataset.productId || new URLSearchParams(window.location.search).get("id") || "nombre_viento";
      agregarProducto(id);
      return;
    }

    const accionCarrito = ev.target.closest("[data-cart-action]");
    if (accionCarrito) {
      const id = accionCarrito.dataset.productId;
      const accion = accionCarrito.dataset.cartAction;

      if (accion === "sumar") cambiarCantidad(id, 1);
      if (accion === "restar") cambiarCantidad(id, -1);
      if (accion === "eliminar") pedirConfirmacionEliminar(id);
      return;
    }

    if (ev.target.closest("#confirmarEliminarProducto")) {
      eliminarProductoConfirmado();
      return;
    }

    if (ev.target.closest("[data-scroll-top]")) {
      subirAlInicio();
      return;
    }

    if (ev.target.closest("[data-finalizar-compra]")) {
      mostrarNotificacion("Compra simulada correctamente.");
    }
  });

  document.addEventListener("keydown", (ev) => {
    if (ev.altKey && ev.key.toLowerCase() === "u") {
      ev.preventDefault();
      subirAlInicio();
      mostrarNotificacion("Atajo Alt + U: subida al inicio.", "info");
    }
  });

  window.addEventListener("scroll", actualizarBotonSubir);
  window.addEventListener("resize", ajustarBannerResponsive);
}

function iniciarWeb() {
  iniciarTema();
  crearBotonSubir();
  asegurarResumenCarrito();
  renderResumenCarrito();
  renderCarritoPagina();
  iniciarZoomImagenes();
  iniciarLeerMas();
  iniciarValoracion();
  iniciarEventos();
  actualizarBotonSubir();
}

window.addEventListener("DOMContentLoaded", iniciarWeb);

window.addEventListener("load", () => {
  ajustarBannerResponsive();
  activarAnimacionesScroll();
  crearGraficoLibreria();
});
