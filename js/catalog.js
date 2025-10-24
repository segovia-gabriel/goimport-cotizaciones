// Helper: lee un campo de especificaciones por etiqueta ("Marca", "Modelo", etc.)
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

// Detectar nombre de página (para armar mejor el mensaje si querés custom más adelante)
function getPageName() {
  try {
    const path = (window.location && window.location.pathname) || '';
    const file = path.split('/').pop() || '';
    return file.replace(/\.html?$/i, '').toLowerCase();
  } catch (_) {
    return '';
  }
}

// Arma el mensaje de WhatsApp con info del producto + precio ARS final
function buildMensaje(producto, precioARS) {
  const titulo = producto.querySelector('h2')?.textContent?.trim() || 'Producto';
  const marca = getSpec(producto, 'Marca');
  const modelo = getSpec(producto, 'Modelo');
  const color = getSpec(producto, 'Color');
  const talles = getSpec(producto, 'Talles');

  // Ejemplo de mensaje:
  // "Hola! Estoy interesado en este producto que vi en su web:
  // Pro Tork Coyote / Marca: Pro Tork / Modelo: Coyote / Color: Gris / Talles: S, M, L
  // Precio aprox: $ 123.456,78 ARS
  // ¿Está disponible?"
  let lineas = [
    'Hola! Estoy interesado en este producto que vi en su web:',
    `${titulo}`,
  ];

  if (marca) lineas.push(`Marca: ${marca}`);
  if (modelo) lineas.push(`Modelo: ${modelo}`);
  if (color) lineas.push(`Color: ${color}`);
  if (talles) lineas.push(`Talles: ${talles}`);

  lineas.push(`Precio aprox: ${precioARS}`);
  lineas.push('¿Está disponible?');

  return lineas.join('\n');
}

// ================================
// 1) Traer cotización USDT→ARS desde tu backend /api/rate
// ================================
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