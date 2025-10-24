// /api/rate.js
// Endpoint serverless para obtener la cotización USDT/ARS desde Binance (precio de venta)

export default async function handler(req, res) {
  try {
    // Binance usa el par "USDTARS" para mostrar el precio del USDT en pesos argentinos
    const response = await fetch('https://api.binance.com/api/v3/ticker/bookTicker?symbol=USDTARS');
    const data = await response.json();

    // Precio de venta (ask)
    const precioVenta = parseFloat(data.askPrice);
    if (isNaN(precioVenta)) throw new Error('No se pudo obtener el precio de venta');

    res.status(200).json({
      ok: true,
      usdt_ars: precioVenta,
      fuente: 'Binance'
    });
  } catch (err) {
    console.error('Error al obtener cotización Binance:', err);
    res.status(500).json({ ok: false, error: 'Error al obtener cotización' });
  }
}