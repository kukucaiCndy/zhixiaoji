const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputDir = 'f:/work/software/zhixiaoji/miniapp/docs/UXDesign/images';

const icons = [
  { name: 'icon_tab_home_active', prompt: 'Minimalist flat icon of a house, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_study_active', prompt: 'Minimalist flat icon of an open book, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_me_active', prompt: 'Minimalist flat icon of a user silhouette, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_home_inactive', prompt: 'Minimalist flat icon of a house, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_study_inactive', prompt: 'Minimalist flat icon of an open book, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_me_inactive', prompt: 'Minimalist flat icon of a user silhouette, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_trophy', prompt: 'Minimalist flat icon of a trophy, solid amber orange color #B45309, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_bookmark', prompt: 'Minimalist flat icon of a bookmark ribbon, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_settings', prompt: 'Minimalist flat icon of a gear or cogwheel, solid gray color #4B5563, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_info', prompt: 'Minimalist flat icon of an information circle with letter i inside, solid gray color #4B5563, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_grid', prompt: 'Minimalist flat icon of a 3x3 grid of squares, solid white color #FFFFFF, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_code', prompt: 'Minimalist flat icon of code angle brackets with slash inside, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_database', prompt: 'Minimalist flat icon of a database cylinder stack, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_terminal', prompt: 'Minimalist flat icon of a terminal window with command prompt, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_code2', prompt: 'Minimalist flat icon of code angle brackets with number 2, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_braces', prompt: 'Minimalist flat icon of curly braces, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isRealImage(filePath) {
  try {
    const info = execSync(`file "${filePath}"`, { encoding: 'utf8' });
    // Real generated images are 1832x1832; placeholder might be different size
    return info.includes('1832x1832');
  } catch {
    return false;
  }
}

async function generateIcon(icon) {
  const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(icon.prompt)}&image_size=square`;
  const outputPath = path.join(outputDir, `${icon.name}.png`);
  
  // Step 1: Trigger generation
  console.log(`Triggering: ${icon.name}`);
  try {
    execSync(`curl -L -s -o /dev/null "${url}"`, { timeout: 30000 });
  } catch (e) {}
  
  // Step 2: Poll with exponential backoff
  const delays = [20000, 20000, 30000, 30000, 30000]; // Total up to 130s
  for (let i = 0; i < delays.length; i++) {
    await sleep(delays[i]);
    console.log(`  Checking ${icon.name} (attempt ${i + 1})...`);
    try {
      execSync(`curl -L -s -o "${outputPath}" "${url}"`, { timeout: 30000 });
      if (isRealImage(outputPath)) {
        const stats = fs.statSync(outputPath);
        console.log(`  SUCCESS: ${icon.name} (${stats.size} bytes)`);
        return { ok: true, name: icon.name };
      }
    } catch (err) {
      console.log(`  Error: ${err.message}`);
    }
  }
  
  console.error(`  FAILED: ${icon.name}`);
  return { ok: false, name: icon.name };
}

async function main() {
  console.log(`Generating ${icons.length} icons...`);
  // Process in batches of 3 to avoid overwhelming the API
  for (let i = 0; i < icons.length; i += 3) {
    const batch = icons.slice(i, i + 3);
    console.log(`\n--- Batch ${Math.floor(i / 3) + 1}: ${batch.map(b => b.name).join(', ')} ---`);
    await Promise.all(batch.map(generateIcon));
  }
  console.log('\nDone!');
}

main();
