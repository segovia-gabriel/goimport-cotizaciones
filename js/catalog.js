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
  .then(res => res.json())
  .then(data => {
    // data esperado:
    // { ok: true, usdt_ars: 1571.9, fuente: "...", ... }

    if (!data.ok) throw new Error('No se pudo obtener la cotización');
    const valorDolar = parseFloat(data.usdt_ars); // ARS por 1 USDT
    if (isNaN(valorDolar)) throw new Error('Valor de dólar inválido');

    // ================================
    // 2) Recorremos cada producto y calculamos precio final
    // ================================
    document.querySelectorAll('.product').forEach(producto => {
      const usdt = parseFloat(producto.dataset.usdt); // ej. data-usdt="38"
      const precioSpan = producto.querySelector('.precio-ars');
      const disponibilidadSpan = producto.querySelector('.disponibilidad');
      const whatsappBtn = producto.querySelector('.whatsapp-button');

      let precioTexto = 'Error al cargar';

      if (!isNaN(usdt) && precioSpan) {
        // tu fórmula: precioFinal = usdt * cotización * 1.03
        const precioFinal = usdt * valorDolar * 1.03;
        precioTexto = `$ ${precioFinal.toLocaleString('es-AR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })}`;
        precioSpan.textContent = precioTexto;
      } else if (precioSpan) {
        precioSpan.textContent = precioTexto;
      }

      // ================================
      // 3) Armar link de WhatsApp
      // ================================
      const mensaje = buildMensaje(producto, precioTexto);
      const telefono = '595993373769'; // tu número
      const waURL = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

      if (whatsappBtn) {
        const disponibilidad = disponibilidadSpan
          ? disponibilidadSpan.textContent.trim().toLowerCase()
          : '';

        if (disponibilidad === 'sin stock') {
          // Sin stock => dejamos el botón visible pero sin link directo
          whatsappBtn.removeAttribute('href');
          whatsappBtn.classList.add('disabled');
          whatsappBtn.setAttribute('aria-disabled', 'true');
          whatsappBtn.textContent = 'Consultar por WhatsApp';
        } else {
          whatsappBtn.setAttribute('href', waURL);
        }
      }

      // ================================
      // 4) Pintar disponibilidad en verde / rojo
      // ================================
      if (disponibilidadSpan) {
        const txt = disponibilidadSpan.textContent.trim().toLowerCase();
        if (txt === 'en stock') {
          disponibilidadSpan.style.color = 'green';
          disponibilidadSpan.style.fontWeight = 'bold';
        } else if (txt === 'sin stock') {
          disponibilidadSpan.style.color = 'red';
          disponibilidadSpan.style.fontWeight = 'bold';
        }
      }
    });

    // ================================
    // 5) Reordenar cards: stock arriba
    // ================================
    const grid = document.querySelector('.products-grid');
    if (grid) {
      const cards = Array.from(grid.querySelectorAll('.product'));
      cards.sort((a, b) => {
        const aStock = a.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock' ? 0 : 1;
        const bStock = b.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase() === 'en stock' ? 0 : 1;
        return aStock - bStock;
      });
      cards.forEach(c => grid.appendChild(c));
    }
  })
  .catch(err => {
    console.error('Error cargando cotización o calculando precios:', err);
    // fallback visual en caso de error
    document.querySelectorAll('.precio-ars').forEach(span => {
      span.textContent = 'Error al cargar';
    });
  });
