const fs = require('fs');
const read = f => fs.readFileSync(__dirname + '/src/' + f, 'utf8');
const logoB64 = fs.readFileSync(__dirname + '/assets/logo.png').toString('base64');
const LOGO_URI = 'data:image/png;base64,' + logoB64;
const logoJs = `const LOGO_URI = '${LOGO_URI}';
const LOGO_IMG = new Image(); LOGO_IMG.src = LOGO_URI;
const LOGO_READY = (LOGO_IMG.decode ? LOGO_IMG.decode() : new Promise(r => { LOGO_IMG.onload = r; })).catch(() => { });
`;
const js = logoJs + ['m_math.js', 'm_models.js', 'm_scenery.js', 'm_tracks.js', 'm_gl.js', 'm_audio.js', 'm_game.js', 'm_ui.js'].map(read).join('\n');
if (js.includes('</script')) throw new Error('script close tag in js');
const html = `<!DOCTYPE html>
<html lang="id"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<title>Numind Nusantara Racing</title>
<link href="https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&display=swap" rel="stylesheet">
<style>${read('style.css')}</style></head>
<body>
${read('body.html').split('{{LOGO}}').join(LOGO_URI)}
<script>
${js}
</script>
</body></html>`;
fs.writeFileSync(__dirname + '/index.html', html);
console.log('built index.html', (html.length / 1024).toFixed(0) + ' KB');
