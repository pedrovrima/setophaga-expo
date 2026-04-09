const puppeteer = require('puppeteer');
const path = require('path');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeTabletScreenshots() {
  console.log('🚀 Iniciando Puppeteer para tablets...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const baseUrl = 'https://xara-roan.vercel.app';
  const outputDir = path.join(__dirname, '../play-store-assets');

  // Configurações de tablets
  const tablets = [
    {
      name: '7-inch',
      width: 1200,
      height: 1920,
      deviceScaleFactor: 1.5,
      prefix: 'tablet-7-'
    },
    {
      name: '10-inch',
      width: 1600,
      height: 2560,
      deviceScaleFactor: 1.5,
      prefix: 'tablet-10-'
    }
  ];

  for (const tablet of tablets) {
    console.log(`\n📱 Gerando screenshots para tablet ${tablet.name}...`);

    const page = await browser.newPage();
    await page.setViewport({
      width: tablet.width,
      height: tablet.height,
      deviceScaleFactor: tablet.deviceScaleFactor,
    });

    try {
      // Screenshot 1: Página inicial
      console.log(`📸 Screenshot 1: Página inicial (${tablet.name})...`);
      await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await wait(2000);
      await page.screenshot({
        path: path.join(outputDir, `${tablet.prefix}1-home.png`),
        fullPage: false,
      });

      // Screenshot 2: Busca com texto
      console.log(`📸 Screenshot 2: Busca (${tablet.name})...`);
      await page.type('input[placeholder*="Busque"]', 'bem-te-vi');
      await wait(2000);
      await page.screenshot({
        path: path.join(outputDir, `${tablet.prefix}2-search.png`),
        fullPage: false,
      });

      // Screenshot 3: Resultados
      console.log(`📸 Screenshot 3: Resultados (${tablet.name})...`);
      await wait(1000);
      await page.screenshot({
        path: path.join(outputDir, `${tablet.prefix}3-results.png`),
        fullPage: false,
      });

      // Screenshot 4: Página de espécie
      console.log(`📸 Screenshot 4: Página de espécie (${tablet.name})...`);
      try {
        await page.click('[role="button"]');
        await wait(2000);
        await page.screenshot({
          path: path.join(outputDir, `${tablet.prefix}4-species.png`),
          fullPage: false,
        });
      } catch (e) {
        console.log(`⚠️  Não foi possível acessar página de espécie (${tablet.name})`);
      }

      console.log(`✅ Screenshots ${tablet.name} criados!`);

    } catch (error) {
      console.error(`❌ Erro ao tirar screenshots ${tablet.name}:`, error);
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log('\n✅ Todos os screenshots de tablet criados!');
  console.log(`📁 Localização: ${outputDir}`);
}

takeTabletScreenshots();
