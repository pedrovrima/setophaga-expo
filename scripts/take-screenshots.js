const puppeteer = require('puppeteer');
const path = require('path');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshots() {
  console.log('🚀 Iniciando Puppeteer...');

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Configurar para mobile (Pixel 5)
  await page.setViewport({
    width: 393,
    height: 851,
    deviceScaleFactor: 2,
  });

  const outputDir = path.join(__dirname, '../play-store-assets');

  console.log('📁 Criando diretório de saída...');
  const fs = require('fs');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const baseUrl = 'https://xara-roan.vercel.app';

  try {
    // Screenshot 1: Página inicial
    console.log('📸 Screenshot 1: Página inicial...');
    await page.goto(baseUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    await wait(2000);
    await page.screenshot({
      path: path.join(outputDir, '1-home.png'),
      fullPage: false,
    });

    // Screenshot 2: Busca com resultados
    console.log('📸 Screenshot 2: Busca...');
    await page.type('input[placeholder*="Busque"]', 'bem-te-vi');
    await wait(2000);
    await page.screenshot({
      path: path.join(outputDir, '2-search.png'),
      fullPage: false,
    });

    // Screenshot 3: Resultados
    console.log('📸 Screenshot 3: Resultados de busca...');
    await wait(1000);
    await page.screenshot({
      path: path.join(outputDir, '3-results.png'),
      fullPage: false,
    });

    // Screenshot 4: Página de espécie
    console.log('📸 Screenshot 4: Página de espécie...');
    try {
      // Clica no primeiro resultado
      await page.click('[role="button"]');
      await wait(2000);
      await page.screenshot({
        path: path.join(outputDir, '4-species.png'),
        fullPage: false,
      });
    } catch (e) {
      console.log('⚠️  Não foi possível acessar página de espécie');
    }

    console.log('✅ Screenshots criados com sucesso!');
    console.log(`📁 Localização: ${outputDir}`);

  } catch (error) {
    console.error('❌ Erro ao tirar screenshots:', error);
  } finally {
    await browser.close();
  }
}

takeScreenshots();
