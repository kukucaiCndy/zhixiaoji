const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const outputDir = 'f:/work/software/zhixiaoji/miniapp/docs/UXDesign/images';
const concurrency = 4;

const icons = [
  // TabBar active
  { name: 'icon_tab_home_active', prompt: 'Minimalist flat icon of a house, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_study_active', prompt: 'Minimalist flat icon of an open book, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_me_active', prompt: 'Minimalist flat icon of a user silhouette, solid dark navy blue color #1E3A5F, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  // TabBar inactive
  { name: 'icon_tab_home_inactive', prompt: 'Minimalist flat icon of a house, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_study_inactive', prompt: 'Minimalist flat icon of an open book, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_tab_me_inactive', prompt: 'Minimalist flat icon of a user silhouette, solid gray color #777777, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  // Me menu
  { name: 'icon_trophy', prompt: 'Minimalist flat icon of a trophy, solid amber orange color #B45309, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_bookmark', prompt: 'Minimalist flat icon of a bookmark ribbon, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_settings', prompt: 'Minimalist flat icon of a gear or cogwheel, solid gray color #4B5563, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_info', prompt: 'Minimalist flat icon of an information circle with letter i inside, solid gray color #4B5563, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_grid', prompt: 'Minimalist flat icon of a 3x3 grid of squares, solid white color #FFFFFF, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  // Study category
  { name: 'icon_code', prompt: 'Minimalist flat icon of code angle brackets with slash inside, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_database', prompt: 'Minimalist flat icon of a database cylinder stack, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_terminal', prompt: 'Minimalist flat icon of a terminal window with command prompt, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  // HOME rec cards
  { name: 'icon_code2', prompt: 'Minimalist flat icon of code angle brackets with number 2, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
  { name: 'icon_braces', prompt: 'Minimalist flat icon of curly braces, solid blue color #384F84, transparent background, simple geometric shape, no outlines, centered composition, clean design, icon only' },
];

function download(icon) {
  const url = `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(icon.prompt)}&image_size=square`;
  const outputPath = path.join(outputDir, `${icon.name}.png`);
  return new Promise((resolve) => {
    try {
      execSync(`curl -L -s -o "${outputPath}" "${url}"`, { timeout: 120000 });
      const stats = fs.statSync(outputPath);
      console.log(`OK: ${icon.name} (${stats.size} bytes)`);
      resolve({ ok: true, name: icon.name });
    } catch (err) {
      console.error(`FAIL: ${icon.name}`, err.message);
      resolve({ ok: false, name: icon.name });
    }
  });
}

async function main() {
  console.log(`Generating ${icons.length} icons to ${outputDir}...`);
  for (let i = 0; i < icons.length; i += concurrency) {
    const batch = icons.slice(i, i + concurrency);
    console.log(`\nBatch ${Math.floor(i / concurrency) + 1}: ${batch.map(b => b.name).join(', ')}`);
    await Promise.all(batch.map(download));
  }
  console.log('\nDone!');
}

main();
