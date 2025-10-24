// /api/rate.js
// Cotización USDT/ARS (fuente: CriptoYa, exchange: ripioexchange)

export default async function handler(req, res) {
  try {
    const response = await fetch('https://criptoya.com/api/usdt/ars', {
      headers: { 'Cache-Control': 'no-cache' }
    });

    if (!response.ok) throw new Error('Error al conectar con CriptoYa');

    const data = await response.json();

    // Tomamos el exchange específico "ripioexchange"
    const ripio = data?.ripioexchange;
    if (!ripio || isNaN(parseFloat(ripio.ask))) {
      throw new Error('Datos inválidos de RipioExchange');
    }

    const precioVenta = parseFloat(ripio.ask);

    return res.status(200).json({
      ok: true,
      usdt_ars: precioVenta,
      fuente: 'CriptoYa (RipioExchange)',
      actualizado: new Date().toISOString()
    });
  } catch (err) {
    console.error('Error obteniendo cotización:', err);
    const fallback = parseFloat(process.env.USDT_ARS_FALLBACK) || 1400;
    return res.status(200).json({
      ok: true,
      usdt_ars: fallback,
      fuente: 'Fallback manual',
      actualizado: new Date().toISOString()
    });
  }
}