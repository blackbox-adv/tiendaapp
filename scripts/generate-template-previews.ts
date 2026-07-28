/**
 * Generate professional template preview images for TiendApp
 * Uses Playwright to render each template as a real store and screenshot it
 */
import { chromium } from 'playwright';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'public', 'templates');

// Template preview HTML - each one is a realistic mini-store
const templateHTMLs: Record<string, string> = {
  moderna: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #fff; border-bottom: 1px solid #f0f0f0; }
  .nav-logo { display: flex; align-items: center; gap: 8px; }
  .nav-logo .icon { width: 32px; height: 32px; border-radius: 8px; background: #7C3AED; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: bold; font-size: 14px; }
  .nav-logo span { font-weight: 700; font-size: 18px; color: #1a1a2e; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 14px; color: #6b7280; text-decoration: none; }
  .nav-links a.active { color: #7C3AED; font-weight: 600; }
  .nav-contact { background: #7C3AED; color: #fff; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600; border: none; }
  .hero { position: relative; height: 280px; background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 40%, #4C1D95 100%); display: flex; align-items: center; justify-content: center; text-align: center; overflow: hidden; }
  .hero::before { content: ''; position: absolute; inset: 0; background: url("data:image/svg+xml,%3Csvg width='60' height='60' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='30' cy='30' r='1.5' fill='rgba(255,255,255,0.08)'/%3E%3C/svg%3E"); }
  .hero-content { position: relative; z-index: 1; color: #fff; }
  .hero-content h1 { font-size: 36px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
  .hero-content p { font-size: 16px; opacity: 0.85; }
  .section { padding: 32px 24px; }
  .section-title { font-size: 20px; font-weight: 700; margin-bottom: 20px; text-align: center; }
  .products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; max-width: 800px; margin: 0 auto; }
  .product { border-radius: 12px; overflow: hidden; border: 1px solid #f0f0f0; transition: box-shadow 0.2s; }
  .product-img { height: 140px; display: flex; align-items: center; justify-content: center; font-size: 48px; }
  .product-img.p1 { background: linear-gradient(135deg, #EDE9FE, #DDD6FE); }
  .product-img.p2 { background: linear-gradient(135deg, #F3F4F6, #E5E7EB); }
  .product-img.p3 { background: linear-gradient(135deg, #FCE7F3, #FBCFE8); }
  .product-img.p4 { background: linear-gradient(135deg, #E0E7FF, #C7D2FE); }
  .product-info { padding: 12px; }
  .product-name { font-size: 13px; font-weight: 600; color: #1a1a2e; margin-bottom: 4px; }
  .product-price { font-size: 14px; font-weight: 700; color: #7C3AED; }
  .whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 24px auto; padding: 12px 24px; background: #25D366; color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; max-width: 260px; }
  .whatsapp-btn::before { content: '📱'; font-size: 18px; }
</style>
</head>
<body>
  <nav class="nav">
    <div class="nav-logo">
      <div class="icon">⚡</div>
      <span>Mi Tienda</span>
    </div>
    <div class="nav-links">
      <a href="#">Inicio</a>
      <a href="#">Ropa</a>
      <a href="#">Accesorios</a>
      <a class="active" href="#">Contacto</a>
    </div>
    <button class="nav-contact">WhatsApp</button>
  </nav>
  <div class="hero">
    <div class="hero-content">
      <h1>NUEVA COLECCIÓN</h1>
      <p>Primavera / Verano 2025</p>
    </div>
  </div>
  <div class="section">
    <div class="section-title">Nuestros Productos</div>
    <div class="products">
      <div class="product">
        <div class="product-img p1">👗</div>
        <div class="product-info">
          <div class="product-name">Vestido Floral</div>
          <div class="product-price">S/89.00</div>
        </div>
      </div>
      <div class="product">
        <div class="product-img p2">🧥</div>
        <div class="product-info">
          <div class="product-name">Blazer Negro</div>
          <div class="product-price">S/149.00</div>
        </div>
      </div>
      <div class="product">
        <div class="product-img p3">👚</div>
        <div class="product-info">
          <div class="product-name">Top Crochet</div>
          <div class="product-price">S/65.00</div>
        </div>
      </div>
      <div class="product">
        <div class="product-img p4">👖</div>
        <div class="product-info">
          <div class="product-name">Pantalón Wide</div>
          <div class="product-price">S/110.00</div>
        </div>
      </div>
    </div>
    <div class="whatsapp-btn">Pedir por WhatsApp</div>
  </div>
</body>
</html>`,

  vibrante: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff; color: #1a1a2e; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: linear-gradient(90deg, #F97316, #EC4899); }
  .nav-logo { font-weight: 800; font-size: 18px; color: #fff; }
  .nav-links { display: flex; gap: 16px; }
  .nav-links a { font-size: 13px; color: rgba(255,255,255,0.85); text-decoration: none; }
  .categories { display: flex; gap: 8px; padding: 16px 24px; overflow-x: auto; }
  .cat-pill { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; white-space: nowrap; }
  .cat-pill.active { background: #F97316; color: #fff; }
  .cat-pill:not(.active) { background: #FFF7ED; color: #EA580C; }
  .products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; padding: 0 24px 16px; }
  .product { border-radius: 12px; overflow: hidden; }
  .product-img { height: 120px; display: flex; align-items: center; justify-content: center; font-size: 40px; }
  .product-img.c1 { background: #FCE7F3; }
  .product-img.c2 { background: #CCFBF1; }
  .product-img.c3 { background: #FEF9C3; }
  .product-img.c4 { background: #FFE4E6; }
  .product-img.c5 { background: #DBEAFE; }
  .product-img.c6 { background: #F3E8FF; }
  .product-info { padding: 8px 10px; }
  .product-name { font-size: 12px; font-weight: 600; }
  .product-price { font-size: 13px; font-weight: 700; color: #EA580C; }
  .promo { margin: 16px 24px; padding: 20px; border-radius: 16px; background: linear-gradient(90deg, #FBBF24, #F97316, #EC4899); text-align: center; color: #fff; }
  .promo h3 { font-size: 20px; font-weight: 800; }
  .promo p { font-size: 12px; opacity: 0.9; margin-top: 4px; }
  .whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 16px 24px; padding: 12px 24px; background: #25D366; color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; }
</style>
</head>
<body>
  <nav class="nav">
    <div class="nav-logo">🔥 La Tienda</div>
    <div class="nav-links">
      <a href="#">Inicio</a>
      <a href="#">Catálogo</a>
      <a href="#">Ofertas</a>
    </div>
  </nav>
  <div class="categories">
    <div class="cat-pill active">Todo</div>
    <div class="cat-pill">Ropa</div>
    <div class="cat-pill">Accesorios</div>
    <div class="cat-pill">Zapatos</div>
    <div class="cat-pill">Bolsos</div>
  </div>
  <div class="products">
    <div class="product"><div class="product-img c1">👕</div><div class="product-info"><div class="product-name">Polera Oversize</div><div class="product-price">S/45.00</div></div></div>
    <div class="product"><div class="product-img c2">🧢</div><div class="product-info"><div class="product-name">Gorra Urban</div><div class="product-price">S/25.00</div></div></div>
    <div class="product"><div class="product-img c3">👟</div><div class="product-info"><div class="product-name">Zapatillas Pro</div><div class="product-price">S/120.00</div></div></div>
    <div class="product"><div class="product-img c4">👜</div><div class="product-info"><div class="product-name">Crossbody Bag</div><div class="product-price">S/55.00</div></div></div>
    <div class="product"><div class="product-img c5">🧣</div><div class="product-info"><div class="product-name">Bufanda Neon</div><div class="product-price">S/30.00</div></div></div>
    <div class="product"><div class="product-img c6">🕶️</div><div class="product-info"><div class="product-name">Lentes Retro</div><div class="product-price">S/35.00</div></div></div>
  </div>
  <div class="promo"><h3>🔥 DESCUENTO 20% HOY</h3><p>Usa el código VERANO20 al pedir por WhatsApp</p></div>
  <div class="whatsapp-btn">📱 Pedir por WhatsApp</div>
</body>
</html>`,

  clasica: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #FFFBEB; color: #78350F; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 12px 24px; background: #78350F; }
  .nav-logo { display: flex; align-items: center; gap: 8px; }
  .nav-logo .icon { width: 28px; height: 28px; border-radius: 6px; background: #92400E; display: flex; align-items: center; justify-content: center; color: #FDE68A; font-weight: bold; font-size: 14px; }
  .nav-logo span { font-weight: 700; font-size: 17px; color: #FDE68A; letter-spacing: 0.5px; }
  .nav-links { display: flex; gap: 20px; }
  .nav-links a { font-size: 13px; color: #FDE68A; text-decoration: none; opacity: 0.8; }
  .hero { height: 240px; background: linear-gradient(135deg, #92400E, #78350F, #451A03); display: flex; align-items: center; justify-content: center; text-align: center; }
  .hero-content { color: #FDE68A; }
  .hero-content h1 { font-size: 32px; font-weight: 700; letter-spacing: 2px; }
  .hero-content p { font-size: 14px; opacity: 0.75; margin-top: 8px; font-style: italic; }
  .section { padding: 24px; max-width: 700px; margin: 0 auto; }
  .product { display: flex; align-items: center; gap: 16px; padding: 14px; margin-bottom: 10px; background: #fff; border-radius: 12px; border: 1px solid #FDE68A; }
  .product-img { width: 64px; height: 64px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 28px; }
  .product-img.c1 { background: #FEF3C7; }
  .product-img.c2 { background: #FDE68A; }
  .product-img.c3 { background: #FCD34D; }
  .product-info { flex: 1; }
  .product-name { font-size: 14px; font-weight: 700; color: #78350F; }
  .product-price { font-size: 15px; font-weight: 700; color: #92400E; margin-top: 2px; }
  .product-desc { font-size: 11px; color: #A16207; margin-top: 2px; }
  .whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px auto; padding: 12px 24px; background: #25D366; color: #fff; border-radius: 12px; font-size: 14px; font-weight: 600; max-width: 260px; }
</style>
</head>
<body>
  <nav class="nav">
    <div class="nav-logo">
      <div class="icon">T</div>
      <span>Artesanías PE</span>
    </div>
    <div class="nav-links">
      <a href="#">Productos</a>
      <a href="#">Sobre Nosotros</a>
      <a href="#">Contacto</a>
    </div>
  </nav>
  <div class="hero">
    <div class="hero-content">
      <h1>HECHO CON AMOR</h1>
      <p>Artesanía peruana directa del artesano a tu hogar</p>
    </div>
  </div>
  <div class="section">
    <div class="product">
      <div class="product-img c1">🏺</div>
      <div class="product-info">
        <div class="product-name">Cerámica Navideña</div>
        <div class="product-price">S/35.00</div>
        <div class="product-desc">Hecho a mano en Cusco</div>
      </div>
    </div>
    <div class="product">
      <div class="product-img c2">🧣</div>
      <div class="product-info">
        <div class="product-name">Manta de Alpaca</div>
        <div class="product-price">S/180.00</div>
        <div class="product-desc">100% alpaca baby</div>
      </div>
    </div>
    <div class="product">
      <div class="product-img c3">📿</div>
      <div class="product-info">
        <div class="product-name">Joyería de Plata</div>
        <div class="product-price">S/95.00</div>
        <div class="product-desc">Plata 925 peruana</div>
      </div>
    </div>
  </div>
  <div class="whatsapp-btn">📱 Pedir por WhatsApp</div>
</body>
</html>`,

  luxury: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Georgia, 'Times New Roman', serif; background: #0f0f1a; color: #c8a456; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 14px 24px; background: #0a0a15; border-bottom: 1px solid rgba(200,164,86,0.15); }
  .nav-logo { display: flex; align-items: center; gap: 10px; }
  .nav-logo .icon { width: 30px; height: 30px; border: 1px solid rgba(200,164,86,0.4); border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #c8a456; font-weight: bold; font-size: 13px; letter-spacing: 1px; }
  .nav-logo span { font-weight: 700; font-size: 16px; color: #c8a456; letter-spacing: 3px; }
  .nav-links { display: flex; gap: 20px; }
  .nav-links a { font-size: 12px; color: rgba(200,164,86,0.5); text-decoration: none; letter-spacing: 2px; text-transform: uppercase; }
  .divider { height: 1px; background: linear-gradient(90deg, transparent, #c8a456, transparent); }
  .hero { height: 250px; background: #0f0f1a; display: flex; align-items: center; justify-content: center; text-align: center; position: relative; }
  .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at center, rgba(200,164,86,0.05) 0%, transparent 70%); }
  .hero-content { position: relative; z-index: 1; }
  .hero-content h1 { font-size: 30px; font-weight: 700; color: #c8a456; letter-spacing: 8px; text-transform: uppercase; }
  .hero-content p { font-size: 12px; color: rgba(240,208,120,0.5); letter-spacing: 4px; margin-top: 8px; text-transform: uppercase; }
  .products { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 24px; max-width: 700px; margin: 0 auto; }
  .product { border-radius: 12px; border: 1px solid rgba(200,164,86,0.2); overflow: hidden; background: rgba(26,26,46,0.5); }
  .product-img { height: 110px; background: linear-gradient(135deg, #1a1a2e, #2a2a4e); display: flex; align-items: center; justify-content: center; font-size: 36px; }
  .product-info { padding: 10px; }
  .product-name { font-size: 11px; color: rgba(200,164,86,0.7); letter-spacing: 1px; text-transform: uppercase; }
  .product-price { font-size: 13px; font-weight: 700; color: #f0d078; margin-top: 4px; }
  .whatsapp-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin: 20px auto; padding: 10px 24px; background: rgba(200,164,86,0.1); border: 1px solid rgba(200,164,86,0.2); color: #c8a456; border-radius: 8px; font-size: 12px; font-weight: 600; max-width: 220px; letter-spacing: 1px; }
</style>
</head>
<body>
  <nav class="nav">
    <div class="nav-logo">
      <div class="icon">L</div>
      <span>LUXE STORE</span>
    </div>
    <div class="nav-links">
      <a href="#">COLECCIÓN</a>
      <a href="#">EXCLUSIVO</a>
    </div>
  </nav>
  <div class="divider"></div>
  <div class="hero">
    <div class="hero-content">
      <h1>EXCLUSIVO</h1>
      <p>Colección Privada 2025</p>
    </div>
  </div>
  <div class="divider"></div>
  <div class="products">
    <div class="product"><div class="product-img">👜</div><div class="product-info"><div class="product-name">Bolso Dorado</div><div class="product-price">S/580.00</div></div></div>
    <div class="product"><div class="product-img">👗</div><div class="product-info"><div class="product-name">Vestido Gala</div><div class="product-price">S/890.00</div></div></div>
    <div class="product"><div class="product-img">💎</div><div class="product-info"><div class="product-name">Anillo Diamond</div><div class="product-price">S/1,200.00</div></div></div>
  </div>
  <div class="whatsapp-btn">✉ CONSULTAR</div>
</body>
</html>`,

  minimalist: `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif; background: #fff; color: #111; }
  .nav { display: flex; align-items: center; justify-content: space-between; padding: 16px 32px; border-bottom: 1px solid #e5e5e5; }
  .nav-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; }
  .nav-links { display: flex; gap: 24px; }
  .nav-links a { font-size: 12px; color: #999; text-decoration: none; letter-spacing: 1px; text-transform: uppercase; }
  .hero { height: 220px; background: #fafafa; display: flex; align-items: center; justify-content: center; text-align: center; }
  .hero h1 { font-size: 36px; font-weight: 300; letter-spacing: 6px; text-transform: uppercase; }
  .hero-line { width: 40px; height: 1px; background: #111; margin: 12px auto; }
  .products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px; background: #e5e5e5; border: 1px solid #e5e5e5; max-width: 700px; margin: 0 auto; }
  .product-img { aspect-ratio: 1; background: #fafafa; display: flex; align-items: center; justify-content: center; font-size: 36px; }
  .detail { padding: 32px; max-width: 700px; margin: 0 auto; display: flex; align-items: center; gap: 32px; }
  .detail-img { width: 200px; height: 200px; background: #f5f5f5; display: flex; align-items: center; justify-content: center; font-size: 60px; }
  .detail-info h2 { font-size: 20px; font-weight: 500; letter-spacing: 1px; }
  .detail-info .price { font-size: 16px; color: #666; margin-top: 8px; }
  .detail-info .btn { display: inline-block; margin-top: 16px; padding: 10px 24px; background: #111; color: #fff; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; }
</style>
</head>
<body>
  <nav class="nav">
    <div class="nav-logo">store.</div>
    <div class="nav-links">
      <a href="#">SHOP</a>
      <a href="#">ABOUT</a>
    </div>
  </nav>
  <div class="hero">
    <div>
      <h1>Essentials</h1>
      <div class="hero-line"></div>
    </div>
  </div>
  <div class="products">
    <div class="product-img">👕</div>
    <div class="product-img">👖</div>
    <div class="product-img">🧥</div>
    <div class="product-img">👟</div>
  </div>
  <div class="detail">
    <div class="detail-img">👕</div>
    <div class="detail-info">
      <h2>White Tee</h2>
      <div class="price">S/45.00</div>
      <div class="btn">Agregar al carrito</div>
    </div>
  </div>
</body>
</html>`,
};

async function generatePreviews() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 800, height: 900 },
    deviceScaleFactor: 2, // Retina quality
  });

  for (const [id, html] of Object.entries(templateHTMLs)) {
    console.log(`Generating preview for ${id}...`);
    const page = await context.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500); // Let fonts render

    const screenshotPath = join(OUTPUT_DIR, `${id}-preview.png`);
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
      type: 'png',
    });

    console.log(`✅ Saved ${screenshotPath}`);
    await page.close();
  }

  await browser.close();
  console.log('All previews generated!');
}

generatePreviews().catch(console.error);
