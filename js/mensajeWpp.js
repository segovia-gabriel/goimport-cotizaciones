    console.log('[GoImport] mensajeWpp.js cargó');

    // Función que procesa UNA card de producto
    function procesarProducto(producto) {
    const boton = producto.querySelector('.whatsapp-button');
    if (!boton) return;

    const disponibilidadSpan = producto.querySelector('.disponibilidad');
    const disponibilidadTexto = disponibilidadSpan
        ? disponibilidadSpan.textContent.trim()
        : '';

    // si no hay stock, no generamos link
    if (disponibilidadTexto.toLowerCase() === 'sin stock') return;

    // leemos el precio en pesos que ya calculó precio_usdt_ars.js
    const precioPesos = producto.querySelector('.precio-ars')?.textContent?.trim() || '';
    if (!precioPesos || precioPesos.toLowerCase().includes('cargando')) {
        // todavía no está listo el precio para este producto, no seteamos link todavía
        return;
    }

    // título del producto
    const tituloProducto = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

    // specs visibles
    const specs = producto.querySelectorAll('.specifications p');
    const detalles = [];
    specs.forEach(p => {
        const linea = p.textContent.trim();
        if (!linea) return;

        const lower = linea.toLowerCase();
        // evitamos repetir info de precio
        if (lower.startsWith('precio:')) return;
        if (lower.startsWith('precio en pesos:')) return;

        detalles.push(linea);
    });

    // precio en USDT (atributo del producto)
    const usdtStr = producto.getAttribute('data-usdt') || '-';

    // mensaje final SIN espacios raros delante
    const mensaje =
    `Hola GoImport!

    Estoy interesado en este producto que vi en su web:
    ${tituloProducto}
    ${detalles.join('\n')}

    Precio: ${usdtStr} USDT (${precioPesos})

    ¿Podrían confirmarme si está disponible?
    Gracias!`;

    const telefono = '595993373769';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    boton.setAttribute('href', url);
    console.log('[GoImport] WhatsApp href seteado:', url);
    }

    // Intentamos varias veces hasta que todos los productos tengan precio listo
    function inicializarLinksWhatsAppConRetry(intentosRestantes = 10) {
    document.querySelectorAll('.product').forEach(procesarProducto);

    if (intentosRestantes > 0) {
        // chequeamos si todavía hay algún producto con precio "Cargando..."
        const quedanCargando = Array.from(document.querySelectorAll('.product')).some(prod => {
        const precio = prod.querySelector('.precio-ars')?.textContent?.trim().toLowerCase() || '';
        return precio.includes('cargando');
        });

        if (quedanCargando) {
        setTimeout(() => {
            inicializarLinksWhatsAppConRetry(intentosRestantes - 1);
        }, 200);
        }
    }
    }

// arrancamos
inicializarLinksWhatsAppConRetry();