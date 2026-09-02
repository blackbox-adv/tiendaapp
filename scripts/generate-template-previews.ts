/**
 * Generate professional template preview images with REAL product photos from Unsplash
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = join(process.cwd(), 'public', 'templates');

const I = {
  dress: 'https://images.unsplash.com/photo-1595777167546-7e6e5e077222?w=400&h=500&fit=crop&crop=center',
  blazer: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=500&fit=crop&crop=center',
  top: 'https://images.unsplash.com/photo-1564257631407-4deb1f2d4cb5?w=400&h=500&fit=crop&crop=center',
  pants: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400&h=500&fit=crop&crop=center',
  hoodie: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=500&fit=crop&crop=center',
  cap: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=500&fit=crop&crop=center',
  sneakers: 'https://images.unsplash.com/photo-1542291026-7eec67c5064?w=400&h=500&fit=crop&crop=center',
  bag: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&crop=center',
  scarf: 'https://images.unsplash.com/photo-1601924990987-69426850e596?w=400&h=500&fit=crop&crop=center',
  sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&h=500&fit=crop&crop=center',
  pottery: 'https://images.unsplash.com/photo-1565193565936-417e2ad4c47c?w=400&h=500&fit=crop&crop=center',
  alpaca: 'https://images.unsplash.com/photo-1608234807905-44660237da2c?w=400&h=500&fit=crop&crop=center',
  jewelry: 'https://images.unsplash.com/photo-1515562141589-67f0c569706f?w=400&h=500&fit=crop&crop=center',
  ring: 'https://images.unsplash.com/photo-1605100804763-247f67b35570?w=400&h=500&fit=crop&crop=center',
  tee: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center',
  jeans: 'https://images.unsplash.com/photo-1542272604-787c3824274d?w=400&h=500&fit=crop&crop=center',
  coat: 'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=400&h=500&fit=crop&crop=center',
  shoes: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=400&h=500&fit=crop&crop=center',
  fashionBanner: 'https://images.unsplash.com/photo-1441984304475-1dfefb47fabc?w=800&h=400&fit=crop&crop=center',
  warmBanner: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=800&h=400&fit=crop&crop=center',
};

const T: Record<string, string> = {
  moderna: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fff}
.nav{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;border-bottom:1px solid #f0f0f0}
.logo{display:flex;align-items:center;gap:8px}.logo .ic{width:32px;height:32px;border-radius:8px;background:#7C3AED;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:bold;font-size:14px}
.logo span{font-weight:700;font-size:18px}.links{display:flex;gap:24px}.links a{font-size:14px;color:#6b7280;text-decoration:none}.links a.a{color:#7C3AED;font-weight:600}
.cta{background:#7C3AED;color:#fff;padding:8px 16px;border-radius:8px;font-size:13px;font-weight:600}
.hero{position:relative;height:280px;overflow:hidden}.hero img{width:100%;height:100%;object-fit:cover}
.hero .ov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(124,58,237,0.85),rgba(76,29,149,0.7))}
.hero .ct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#fff}
.hero .ct h1{font-size:36px;font-weight:800}.hero .ct p{font-size:16px;opacity:0.85;margin-top:4px}
.sec{padding:32px 24px}.sec h2{font-size:20px;font-weight:700;text-align:center;margin-bottom:20px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px;max-width:800px;margin:0 auto}
.card{border-radius:12px;overflow:hidden;border:1px solid #f0f0f0}.card .img{height:160px;overflow:hidden}.card .img img{width:100%;height:100%;object-fit:cover}
.card .info{padding:12px}.card .nm{font-size:13px;font-weight:600;color:#1a1a2e}.card .pr{font-size:14px;font-weight:700;color:#7C3AED;margin-top:2px}
.wa{display:flex;align-items:center;justify-content:center;gap:8px;margin:24px auto;padding:12px 24px;background:#25D366;color:#fff;border-radius:12px;font-size:14px;font-weight:600;max-width:260px}
</style></head><body>
<div class="nav"><div class="logo"><div class="ic">⚡</div><span>Mi Tienda</span></div><div class="links"><a href="#">Inicio</a><a href="#">Ropa</a><a href="#">Accesorios</a><a class="a" href="#">Contacto</a></div><div class="cta">WhatsApp</div></div>
<div class="hero"><img src="${I.fashionBanner}"/><div class="ov"></div><div class="ct"><div><h1>NUEVA COLECCIÓN</h1><p>Primavera / Verano 2025</p></div></div></div>
<div class="sec"><h2>Nuestros Productos</h2><div class="grid">
<div class="card"><div class="img"><img src="${I.dress}"/></div><div class="info"><div class="nm">Vestido Floral</div><div class="pr">S/89.00</div></div></div>
<div class="card"><div class="img"><img src="${I.blazer}"/></div><div class="info"><div class="nm">Blazer Negro</div><div class="pr">S/149.00</div></div></div>
<div class="card"><div class="img"><img src="${I.top}"/></div><div class="info"><div class="nm">Top Crochet</div><div class="pr">S/65.00</div></div></div>
<div class="card"><div class="img"><img src="${I.pants}"/></div><div class="info"><div class="nm">Pantalón Wide</div><div class="pr">S/110.00</div></div></div>
</div><div class="wa">📱 Pedir por WhatsApp</div></div>
</body></html>`,

  vibrante: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#fff}
.nav{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:linear-gradient(90deg,#F97316,#EC4899)}
.logo{font-weight:800;font-size:18px;color:#fff}.links{display:flex;gap:16px}.links a{font-size:13px;color:rgba(255,255,255,0.85);text-decoration:none}
.cats{display:flex;gap:8px;padding:16px 24px}.cat{padding:6px 16px;border-radius:20px;font-size:12px;font-weight:600}.cat.a{background:#F97316;color:#fff}.cat:not(.a){background:#FFF7ED;color:#EA580C}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;padding:0 24px 16px}
.card{border-radius:12px;overflow:hidden}.card .img{height:140px;overflow:hidden}.card .img img{width:100%;height:100%;object-fit:cover}
.card .info{padding:8px 10px}.card .nm{font-size:12px;font-weight:600}.card .pr{font-size:13px;font-weight:700;color:#EA580C}
.promo{margin:16px 24px;padding:24px;border-radius:16px;background:linear-gradient(90deg,#FBBF24,#F97316,#EC4899);text-align:center;color:#fff}
.promo h3{font-size:22px;font-weight:800}.promo p{font-size:12px;opacity:0.9;margin-top:4px}
.wa{display:flex;align-items:center;justify-content:center;gap:8px;margin:16px 24px;padding:12px 24px;background:#25D366;color:#fff;border-radius:12px;font-size:14px;font-weight:600}
</style></head><body>
<div class="nav"><div class="logo">🔥 La Tienda</div><div class="links"><a href="#">Inicio</a><a href="#">Catálogo</a><a href="#">Ofertas</a></div></div>
<div class="cats"><div class="cat a">Todo</div><div class="cat">Ropa</div><div class="cat">Accesorios</div><div class="cat">Zapatos</div><div class="cat">Bolsos</div></div>
<div class="grid">
<div class="card"><div class="img"><img src="${I.hoodie}"/></div><div class="info"><div class="nm">Polera Oversize</div><div class="pr">S/45.00</div></div></div>
<div class="card"><div class="img"><img src="${I.cap}"/></div><div class="info"><div class="nm">Gorra Urban</div><div class="pr">S/25.00</div></div></div>
<div class="card"><div class="img"><img src="${I.sneakers}"/></div><div class="info"><div class="nm">Zapatillas Pro</div><div class="pr">S/120.00</div></div></div>
<div class="card"><div class="img"><img src="${I.bag}"/></div><div class="info"><div class="nm">Crossbody Bag</div><div class="pr">S/55.00</div></div></div>
<div class="card"><div class="img"><img src="${I.scarf}"/></div><div class="info"><div class="nm">Bufanda Neon</div><div class="pr">S/30.00</div></div></div>
<div class="card"><div class="img"><img src="${I.sunglasses}"/></div><div class="info"><div class="nm">Lentes Retro</div><div class="pr">S/35.00</div></div></div>
</div>
<div class="promo"><h3>🔥 DESCUENTO 20% HOY</h3><p>Usa el código VERANO20 al pedir por WhatsApp</p></div>
<div class="wa">📱 Pedir por WhatsApp</div>
</body></html>`,

  clasica: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;background:#FFFBEB;color:#78350F}
.nav{display:flex;align-items:center;justify-content:space-between;padding:12px 24px;background:#78350F}
.logo{display:flex;align-items:center;gap:8px}.logo .ic{width:28px;height:28px;border-radius:6px;background:#92400E;display:flex;align-items:center;justify-content:center;color:#FDE68A;font-weight:bold;font-size:14px}
.logo span{font-weight:700;font-size:17px;color:#FDE68A}.links{display:flex;gap:20px}.links a{font-size:13px;color:#FDE68A;text-decoration:none;opacity:0.8}
.hero{position:relative;height:240px;overflow:hidden}.hero img{width:100%;height:100%;object-fit:cover}
.hero .ov{position:absolute;inset:0;background:linear-gradient(135deg,rgba(146,64,14,0.8),rgba(69,26,3,0.85))}
.hero .ct{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;text-align:center;color:#FDE68A}
.hero .ct h1{font-size:32px;font-weight:700;letter-spacing:2px}.hero .ct p{font-size:14px;opacity:0.75;margin-top:8px;font-style:italic}
.sec{padding:24px;max-width:700px;margin:0 auto}
.row{display:flex;align-items:center;gap:16px;padding:14px;margin-bottom:10px;background:#fff;border-radius:12px;border:1px solid #FDE68A}
.row .img{width:64px;height:64px;border-radius:8px;overflow:hidden}.row .img img{width:100%;height:100%;object-fit:cover}
.row .info{flex:1}.row .nm{font-size:14px;font-weight:700;color:#78350F}.row .pr{font-size:15px;font-weight:700;color:#92400E;margin-top:2px}.row .ds{font-size:11px;color:#A16207;margin-top:2px}
.wa{display:flex;align-items:center;justify-content:center;gap:8px;margin:20px auto;padding:12px 24px;background:#25D366;color:#fff;border-radius:12px;font-size:14px;font-weight:600;max-width:260px}
</style></head><body>
<div class="nav"><div class="logo"><div class="ic">T</div><span>Artesanías PE</span></div><div class="links"><a href="#">Productos</a><a href="#">Sobre Nosotros</a></div></div>
<div class="hero"><img src="${I.warmBanner}"/><div class="ov"></div><div class="ct"><div><h1>HECHO CON AMOR</h1><p>Artesanía peruana directa del artesano a tu hogar</p></div></div></div>
<div class="sec">
<div class="row"><div class="img"><img src="${I.pottery}"/></div><div class="info"><div class="nm">Cerámica Navideña</div><div class="pr">S/35.00</div><div class="ds">Hecho a mano en Cusco</div></div></div>
<div class="row"><div class="img"><img src="${I.alpaca}"/></div><div class="info"><div class="nm">Manta de Alpaca</div><div class="pr">S/180.00</div><div class="ds">100% alpaca baby</div></div></div>
<div class="row"><div class="img"><img src="${I.jewelry}"/></div><div class="info"><div class="nm">Joyería de Plata</div><div class="pr">S/95.00</div><div class="ds">Plata 925 peruana</div></div></div>
</div>
<div class="wa">📱 Pedir por WhatsApp</div>
</body></html>`,

  luxury: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:Georgia,serif;background:#0f0f1a;color:#c8a456}
.nav{display:flex;align-items:center;justify-content:space-between;padding:14px 24px;background:#0a0a15;border-bottom:1px solid rgba(200,164,86,0.15)}
.logo{display:flex;align-items:center;gap:10px}.logo .ic{width:30px;height:30px;border:1px solid rgba(200,164,86,0.4);border-radius:6px;display:flex;align-items:center;justify-content:center;color:#c8a456;font-weight:bold;font-size:13px}
.logo span{font-weight:700;font-size:16px;color:#c8a456;letter-spacing:3px}.links{display:flex;gap:20px}.links a{font-size:12px;color:rgba(200,164,86,0.5);text-decoration:none;letter-spacing:2px;text-transform:uppercase}
.divider{height:1px;background:linear-gradient(90deg,transparent,#c8a456,transparent)}
.hero{height:250px;background:#0f0f1a;display:flex;align-items:center;justify-content:center;text-align:center}
.hero h1{font-size:30px;font-weight:700;color:#c8a456;letter-spacing:8px;text-transform:uppercase}.hero p{font-size:12px;color:rgba(240,208,120,0.5);letter-spacing:4px;margin-top:8px;text-transform:uppercase}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:24px;max-width:700px;margin:0 auto}
.card{border-radius:12px;border:1px solid rgba(200,164,86,0.2);overflow:hidden;background:rgba(26,26,46,0.5)}
.card .img{height:120px;overflow:hidden;position:relative}.card .img img{width:100%;height:100%;object-fit:cover;opacity:0.8}
.card .img::after{content:'';position:absolute;inset:0;background:linear-gradient(to bottom,transparent 50%,rgba(15,15,26,0.6) 100%)}
.card .info{padding:10px}.card .nm{font-size:11px;color:rgba(200,164,86,0.7);letter-spacing:1px;text-transform:uppercase}.card .pr{font-size:13px;font-weight:700;color:#f0d078;margin-top:4px}
.wa{display:flex;align-items:center;justify-content:center;gap:8px;margin:20px auto;padding:10px 24px;background:rgba(200,164,86,0.1);border:1px solid rgba(200,164,86,0.2);color:#c8a456;border-radius:8px;font-size:12px;font-weight:600;max-width:220px;letter-spacing:1px}
</style></head><body>
<div class="nav"><div class="logo"><div class="ic">L</div><span>LUXE STORE</span></div><div class="links"><a href="#">COLECCIÓN</a><a href="#">EXCLUSIVO</a></div></div>
<div class="divider"></div>
<div class="hero"><div><h1>EXCLUSIVO</h1><p>Colección Privada 2025</p></div></div>
<div class="divider"></div>
<div class="grid">
<div class="card"><div class="img"><img src="${I.bag}"/></div><div class="info"><div class="nm">BOLSO DORADO</div><div class="pr">S/580.00</div></div></div>
<div class="card"><div class="img"><img src="${I.dress}"/></div><div class="info"><div class="nm">VESTIDO GALA</div><div class="pr">S/890.00</div></div></div>
<div class="card"><div class="img"><img src="${I.ring}"/></div><div class="info"><div class="nm">ANILLO DIAMOND</div><div class="pr">S/1,200.00</div></div></div>
</div>
<div class="wa">✉ CONSULTAR</div>
</body></html>`,

  minimalist: `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,'Helvetica Neue',sans-serif;background:#fff;color:#111}
.nav{display:flex;align-items:center;justify-content:space-between;padding:16px 32px;border-bottom:1px solid #e5e5e5}
.logo{font-size:18px;font-weight:700;letter-spacing:-0.5px}.links{display:flex;gap:24px}.links a{font-size:12px;color:#999;text-decoration:none;letter-spacing:1px;text-transform:uppercase}
.hero{height:220px;background:#fafafa;display:flex;align-items:center;justify-content:center;text-align:center}
.hero h1{font-size:36px;font-weight:300;letter-spacing:6px;text-transform:uppercase}.line{width:40px;height:1px;background:#111;margin:12px auto}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;max-width:700px;margin:0 auto}
.img{aspect-ratio:1;overflow:hidden}.img img{width:100%;height:100%;object-fit:cover}
.detail{padding:32px;max-width:700px;margin:0 auto;display:flex;align-items:center;gap:32px}
.detail .dimg{width:200px;height:200px;overflow:hidden}.detail .dimg img{width:100%;height:100%;object-fit:cover}
.detail h2{font-size:20px;font-weight:500;letter-spacing:1px}.detail .price{font-size:16px;color:#666;margin-top:8px}
.detail .btn{display:inline-block;margin-top:16px;padding:10px 24px;background:#111;color:#fff;font-size:11px;letter-spacing:2px;text-transform:uppercase}
</style></head><body>
<div class="nav"><div class="logo">store.</div><div class="links"><a href="#">SHOP</a><a href="#">ABOUT</a></div></div>
<div class="hero"><div><h1>Essentials</h1><div class="line"></div></div></div>
<div class="grid">
<div class="img"><img src="${I.tee}"/></div>
<div class="img"><img src="${I.jeans}"/></div>
<div class="img"><img src="${I.coat}"/></div>
<div class="img"><img src="${I.shoes}"/></div>
</div>
<div class="detail"><div class="dimg"><img src="${I.tee}"/></div><div><h2>White Tee</h2><div class="price">S/45.00</div><div class="btn">Agregar al carrito</div></div></div>
</body></html>`,
};

async function main() {
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 800, height: 900 }, deviceScaleFactor: 2 });
  for (const [id, html] of Object.entries(T)) {
    console.log(`Generating ${id}...`);
    const page = await ctx.newPage();
    await page.setContent(html, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: join(OUTPUT_DIR, `${id}-preview.png`), fullPage: false, type: 'png' });
    console.log(`✅ ${id}`);
    await page.close();
  }
  await browser.close();
  console.log('Done!');
}
main().catch(console.error);
