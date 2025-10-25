    document.querySelectorAll('.product').forEach(producto => {
    const boton = producto.querySelector('.whatsapp-button');
    const disponibilidad = producto.querySelector('.disponibilidad')?.textContent?.trim().toLowerCase();

    if (!boton) return;
    if (disponibilidad === 'sin stock') return; // no generamos link si no hay stock

    const titulo = producto.querySelector('h2')?.textContent?.trim() || 'Producto';

    // Leemos las specs (Marca, Modelo, Color, etc.)
    const specs = producto.querySelectorAll('.specifications p');
    const detalles = [];
    specs.forEach(p => {
        const txt = p.textContent.trim();
        if (!txt) return;
        // No dupliquemos las líneas de precio dentro del bloque de detalles
        if (txt.toLowerCase().includes('precio')) return;
        detalles.push(txt);
    });

    // Precio
    const usdt = producto.getAttribute('data-usdt') || '-';
    const precioPesos = producto.querySelector('.precio-ars')?.textContent?.trim() || 'Precio no disponible';

    const mensaje =
    `Hola GoImport!

    Estoy interesado en este producto que vi en su web:
    ${titulo}
    ${detalles.join('\n')}

    Precio: ${usdt} USDT (${precioPesos})

    ¿Podrían confirmarme si está disponible?
    Gracias!`;

    const telefono = '595993373769';
    const url = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    boton.setAttribute('href', url);
    });