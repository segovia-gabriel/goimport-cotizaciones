// /api/quote.js
// Función serverless para Vercel (Node 18+)

import { google } from 'googleapis';

const ALLOWED_ORIGINS = [
  'https://<TU-USER>.github.io',
  'https://<TU-USER>.github.io/<TU-REPO>'
];

// Convierte "\n" en saltos reales si Vercel guarda la clave privada escapeada
function normalizePrivateKey(key) {
  return key?.replace(/\\n/g, '\n');
}

export default async function handler(req, res) {
  // CORS
  const origin = req.headers.origin || '';
  if (ALLOWED_ORIGINS.some(o => origin && origin.startsWith(o))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://example.com');
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Solo aceptamos POST reales
  if (req.method !== 'POST') {
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }

  // Chequeo de API key privada para que no cualquiera te llene la planilla
  const clientKey = req.headers['x-api-key'];
  if (!clientKey || clientKey !== process.env.PRIVATE_API_KEY) {
    return res.status(401).json({ ok:false, error:'Unauthorized' });
  }

  // Variables de entorno necesarias
  const {
    GOOGLE_SERVICE_ACCOUNT_EMAIL,
    GOOGLE_SERVICE_ACCOUNT_KEY,
    GOOGLE_SHEETS_ID,
    GOOGLE_SHEETS_RANGE = 'Cotizaciones!A:F' // A=Fecha ... F=URL/LINK
  } = process.env;

  if (!GOOGLE_SERVICE_ACCOUNT_EMAIL ||
      !GOOGLE_SERVICE_ACCOUNT_KEY ||
      !GOOGLE_SHEETS_ID) {
    return res.status(500).json({ ok:false, error:'Missing env vars' });
  }

  // Datos que vienen del formulario
  const body = req.body || {};
  const {
    origen = 'beacons',
    nombre,
    apellido,
    telefono,
    email,
    linkProducto
  } = body;

  // Validaciones mínimas
  if (!nombre || !apellido || !telefono || !linkProducto) {
    return res.status(400).json({
      ok:false,
      error:'Faltan campos obligatorios (nombre, apellido, teléfono, link).'
    });
  }

  try {
    // Autenticarnos con Google Sheets usando la Service Account
    const auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL,
      null,
      normalizePrivateKey(GOOGLE_SERVICE_ACCOUNT_KEY),
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });

    // Fecha/hora ISO. Esto se guarda en la columna A "Fecha"
    const now = new Date().toISOString();

    // Orden de columnas que definiste:
    // A: Fecha
    // B: Nombre
    // C: Apellido
    // D: Teléfono
    // E: Email
    // F: URL o LINK del producto a cotizar
    const row = [
      now,
      (nombre || '').toString().trim().toUpperCase(),
      (apellido || '').toString().trim().toUpperCase(),
      (telefono || '').toString().trim(),
      (email || '').toString().trim(),
      (linkProducto || '').toString().trim()
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: GOOGLE_SHEETS_ID,
      range: GOOGLE_SHEETS_RANGE,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [row] }
    });

    // Si llegamos acá: ya se guardó en Sheets
    // Ahora devolvemos todos los datos útiles para que el frontend pueda armar el WhatsApp
    return res.status(200).json({
      ok:true,
      enviadoA: telefono,
      dataParaWhatsApp: {
        nombre,
        apellido,
        telefono,
        email,
        linkProducto
      }
    });

  } catch (err) {
    console.error('Sheets append error:', err?.response?.data || err);
    return res.status(500).json({ ok:false, error:'Sheets append failed' });
  }
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};