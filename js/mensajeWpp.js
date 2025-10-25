console.log('[GoImport] mensajeWpp.js cargó');

// Procesa UNA card de producto y le setea el link de WhatsApp
function procesarProducto(producto) {
  const boton = producto.querySelector('.whatsapp-button');
  if (!boton) return;

  // disponibilidad: si está sin stock no generamos link
  const disponibilidadSpan = producto.querySelector('.disponibilidad');
  const disponibilidadTexto = disponibilidadSpan
    ? disponibilidadSpan.textContent.trim()
    : '';
  if (disponibilidadTexto.toLowerCase() === 'sin stock') return;

  // necesitamos precio final ya calculado
  const precioPesos = producto.querySelector('.precio-ars')?.textContent?.trim() || '';
  if (!precioPesos || precioPesos.toLowerCase().includes('cargando')) {
    // todavía no está cargado el precio: esperamos con retry afuera
    return;
  }

  // título principal del producto
  const tituloProducto = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

  // leemos todas las specs crudas visibles
  // ejemplo de cada <p>: "Marca: LS2", "Modelo: FF816 Tank Camox", "Talles: S, M, L", etc.
  const specs = producto.querySelectorAll('.specifications p');

  const lineasSpecsLimpias = [];
  specs.forEach(p => {
    let linea = p.textContent.trim();
    if (!linea) return;

    // limpiamos posibles múltiples espacios/saltos raros
    linea = linea.replace(/\s+/g, ' ');

    // filtramos precio para no duplicar
    const lower = linea.toLowerCase();
    if (lower.startsWith('precio:')) return;
    if (lower.startsWith('precio en pesos:')) return;

    lineasSpecsLimpias.push(linea);
  });

  // leemos el precio en USDT desde el atributo data-usdt
  const usdtStr = producto.getAttribute('data-usdt') || '-';

  // armamos el mensaje final sin indentaciones
  // estructura:
  //
  // Hola GoImport!
  //
  // Estoy interesado...
  // <TITULO>
  //
  // <todas las specs en líneas separadas>
  //
  // Precio: X USDT (Y ARS)
  //
  // ¿Podrían...?
  //
  const mensaje =
`Hola GoImport!

Estoy interesado en este producto que vi en su web:
${tituloProducto}

${lineasSpecsLimpias.join('\n')}

Precio: ${usdtStr} USDT (${precioPesos})

¿Podrían confirmarme si está disponible?
Gracias!`;

  const telefono = '595993373769';
  const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

  boton.setAttribute('href', url);
  console.log('[GoImport] WhatsApp href seteado:', url);
}

// Hace retries para asegurarse que el precio ya se calculó
function inicializarLinksWhatsAppConRetry(intentosRestantes = 10) {
  document.querySelectorAll('.product').forEach(procesarProducto);

  if (intentosRestantes > 0) {
    // ¿Todavía hay productos con "Cargando..."?
    const quedanPendientes = Array.from(document.querySelectorAll('.product')).some(prod => {
      const precio = prod.querySelector('.precio-ars')?.textContent?.trim().toLowerCase() || '';
      return precio.includes('cargando');
    });

    if (quedanPendientes) {
      setTimeout(() => {
        inicializarLinksWhatsAppConRetry(intentosRestantes - 1);
      }, 200);
    }
  }
}

// start
inicializarLinksWhatsAppConRetry();