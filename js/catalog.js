// Script unificado de catálogo: cotización ARS, WhatsApp, estados y ordenamiento

// Helper: obtiene el texto de una especificación por etiqueta (ej: "Marca", "Modelo")
function getSpec(producto, etiqueta) {
  const ps = producto.querySelectorAll('.specifications p');
  for (const p of ps) {
    const strong = p.querySelector('strong');
    if (!strong) continue;
    const key = strong.textContent.replace(':', '').trim().toLowerCase();
    if (key === etiqueta.toLowerCase()) {
      const value = p.textContent.split(':').slice(1).join(':').trim();
      return value || '';
    }
  }
  return '';
}

// Detectar página/categoría por nombre de archivo
function getPageName() {
  try {
    const path = (window.location && window.location.pathname) || '';
    const file = path.split('/').pop() || '';
    return file.replace(/\.html?$/i, '').toLowerCase();
  } catch (_) { return ''; }
}

// Construir mensaje personalizado por página/categoría
function buildMensaje(producto, precioARS) {
  const page = getPageName();

  // Helper local para tomar varios campos en orden de preferencia
  const pick = (labels) => labels.map(l => getSpec(producto, l)).filter(Boolean).join(' ');

  // Templating por categoría
  const helmetsFields = ['Marca', 'Modelo', 'Grafico', 'Talles'];
  const phoneFields = ['Marca', 'Modelo', 'Capacidad', 'Memoria', 'Color'];

  let base = '';
  switch (page) {
    case 'smartphones_samsung':
    case 'smartphones_xiaomi':
    case 'smartphones_motorola':
    case 'iphonesellados':
    case 'iphoneswap':
      base = pick(phoneFields) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'macbook':
      base = pick(['Marca','Modelo','Capacidad','Memoria','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'notebooks':
      base = pick(['Marca','Modelo','Procesador','Memoria','Almacenamiento','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'ipads':
    case 'tablets':
      base = pick(['Marca','Modelo','Capacidad','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'smartv':
      base = pick(['Marca','Modelo','Pantalla','Tamaño','Pulgadas','Resolución']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'applewatch':
    case 'smartwatch_xiaomi':
      base = pick(['Marca','Modelo','Tamaño','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'scooter_xiaomi':
      base = pick(['Marca','Modelo','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'gopro':
      base = `GoPro ${getSpec(producto,'Modelo') || (producto.querySelector('h2')?.textContent?.trim() || '')}`.trim();
      break;
    case 'insta360':
      base = `Insta360 ${getSpec(producto,'Modelo') || (producto.querySelector('h2')?.textContent?.trim() || '')}`.trim();
      break;
    case 'dji':
      base = `DJI ${getSpec(producto,'Modelo') || (producto.querySelector('h2')?.textContent?.trim() || '')}`.trim();
      break;
    case 'xbox':
    case 'sonyplaystation':
      base = producto.querySelector('h2')?.textContent?.trim() || pick(['Producto','Marca','Modelo']);
      break;
    case 'parlantesjbl':
      base = pick(['Marca','Modelo','Color','Potencia']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'agv':
    case 'shaft':
    case 'hro':
    case 'protork':
      base = pick(helmetsFields) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    case 'aspiradora_xiaomi':
      base = pick(['Marca','Modelo','Color']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
      break;
    default:
      base = pick(['Marca','Modelo']) || (producto.querySelector('h2')?.textContent?.trim() || 'Producto');
  }

  return `Hola! Estoy interesado en este producto que vi en su web: ${base} ${precioARS}. ¿Está disponible?`;
}

// Cotización y armado de links de WhatsApp (con manejo de stock)
fetch('/api/rate')
  .then(response => response.json())
  .then(data => {
    const valorDolar = parseFloat(data.trim());
    if (isNaN(valorDolar)) throw new Error('Valor de dólar inválido');

    document.querySelectorAll('.product').forEach(producto => {
      const usdt = parseFloat(producto.dataset.usdt);
      const precioSpan = producto.querySelector('.precio-ars');

      let precioFinal = 0;
      let precioTexto = 'Error al cargar';

      if (!isNaN(usdt) && precioSpan) {
        precioFinal = (usdt * valorDolar) * 1.03;
        precioTexto = `$ ${precioFinal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        precioSpan.textContent = precioTexto;
      } else if (precioSpan) {
        precioSpan.textContent = precioTexto;
      }

      const precioARS = producto.querySelector('.precio-ars')?.textContent?.trim() || 'Precio no disponible';
      const mensaje = buildMensaje(producto, precioARS);
      const telefono = '+595993373769';
      const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

      const boton = producto.querySelector('.whatsapp-button');
      if (boton) {
        const disponibilidadTexto = producto.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() || '';
        if (disponibilidadTexto === 'sin stock') {
          boton.removeAttribute('href');
          boton.classList.add('disabled');
          boton.setAttribute('aria-disabled', 'true');
          boton.textContent = 'Consultar por WhatsApp';
        } else {
          boton.setAttribute('href', url);
        }
      }
    });
  })
  .catch(() => {
    document.querySelectorAll('.precio-ars').forEach(span => {
      span.textContent = 'Error al cargar';
    });
  });

// Marcar disponibilidad con color
document.querySelectorAll('.product').forEach(producto => {
  const disponibilidadSpan = producto.querySelector('.disponibilidad');
  if (disponibilidadSpan) {
    const texto = disponibilidadSpan.textContent.trim().toLowerCase();
    if (texto === 'en stock') {
      disponibilidadSpan.style.color = 'green';
      disponibilidadSpan.style.fontWeight = 'bold';
    } else if (texto === 'sin stock') {
      disponibilidadSpan.style.color = 'red';
      disponibilidadSpan.style.fontWeight = 'bold';
    }
  }
});

// Reordenar productos: En stock arriba, Sin stock abajo
(function reordenarPorStock() {
  const grid = document.querySelector('.products-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.product'));
  cards.sort((a, b) => {
    const aEnStock = (a.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock') ? 0 : 1;
    const bEnStock = (b.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock') ? 0 : 1;
    return aEnStock - bEnStock;
  });
  cards.forEach(c => grid.appendChild(c));
})();
