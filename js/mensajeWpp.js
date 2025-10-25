    document.querySelectorAll('.product').forEach(producto => {
    const boton = producto.querySelector('.whatsapp-button');
    const disponibilidadSpan = producto.querySelector('.disponibilidad');
    const disponibilidad = disponibilidadSpan
        ? disponibilidadSpan.textContent.trim().toLowerCase()
        : '';

    if (!boton) return;
    if (disponibilidad === 'sin stock') return;

    const titulo = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

    // Extraemos las specs visibles (Marca, Modelo, Color, Talles, Disponibilidad, etc.)
    const specs = producto.querySelectorAll('.specifications p');
    const detalles = [];
    specs.forEach(p => {
        const txt = p.textContent.trim();
        if (!txt) return;
        // Filtramos líneas que son "Precio:" porque las vamos a armar nosotros
        if (txt.toLowerCase().startsWith('precio:')) return;
        if (txt.toLowerCase().startsWith('precio en pesos:')) return;
        detalles.push(txt);
    });

    // Obtenemos precio en USDT desde el atributo data-usdt
    const usdtStr = producto.getAttribute('data-usdt') || '-';
    const usdtValue = parseFloat(usdtStr);

    // Obtenemos la cotización actual guardada por precio_usdt_ars.js
    const cotizacion = parseFloat(window.COTIZACION_USDT_ARS);

    // Calculamos el precio final en pesos ARS (si tenemos todo)
    let precioPesosTexto = 'Precio no disponible';
    if (!isNaN(usdtValue) && !isNaN(cotizacion)) {
        const precioFinal = usdtValue * cotizacion * 1.03;
        precioPesosTexto = `$ ${precioFinal.toLocaleString('es-AR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
        })}`;
    } else {
        // fallback: usamos lo que esté en el DOM por si ya se cargó
        const fallbackDom = producto.querySelector('.precio-ars')?.textContent?.trim();
        if (fallbackDom) {
        precioPesosTexto = fallbackDom;
        }
    }

    const mensaje =
    `Hola GoImport!

    Estoy interesado en este producto que vi en su web:
    ${titulo}
    ${detalles.join('\n')}

    Precio: ${usdtStr} USDT (${precioPesosTexto})

    ¿Podrían confirmarme si está disponible?
    Gracias!`;

    const telefono = '595993373769';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;

    boton.setAttribute('href', url);
    });