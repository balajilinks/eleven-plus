const fs = require('fs');
const path = require('path');

const buildDir = path.join(__dirname, '..', 'build');
const indexPath = path.join(buildDir, 'index.html');
const standaloneIndexPath = path.join(buildDir, 'index-standalone.html');

console.log('Creating standalone HTML file...');

// Read the current index.html
let html = fs.readFileSync(indexPath, 'utf8');

// First fix any spacing issues in paths
html = html.replace(/\. \/static\//g, './static/');

// Read and inline CSS
const cssMatch = html.match(/href="\.\/static\/css\/([^"]+)"/);
if (cssMatch) {
    const cssPath = path.join(buildDir, 'static', 'css', cssMatch[1]);
    console.log(`Looking for CSS file: ${cssPath}`);
    if (fs.existsSync(cssPath)) {
        const css = fs.readFileSync(cssPath, 'utf8');
        html = html.replace(
            /<link[^>]+href="\.\/static\/css\/[^"]+"[^>]*>/,
            `<style>${css}</style>`
        );
        console.log('✓ CSS inlined');
    } else {
        console.log('❌ CSS file not found');
    }
} else {
    console.log('❌ CSS link not found in HTML');
}

// Read and inline JavaScript
const jsMatch = html.match(/src="\.\/static\/js\/([^"]+)"/);
if (jsMatch) {
    const jsPath = path.join(buildDir, 'static', 'js', jsMatch[1]);
    console.log(`Looking for JS file: ${jsPath}`);
    if (fs.existsSync(jsPath)) {
        const js = fs.readFileSync(jsPath, 'utf8');
        html = html.replace(
            /<script[^>]+src="\.\/static\/js\/[^"]+"[^>]*><\/script>/,
            `<script>${js}</script>`
        );
        console.log('✓ JavaScript inlined');
    } else {
        console.log('❌ JS file not found');
    }
} else {
    console.log('❌ JS script tag not found in HTML');
}

// Write the standalone file
fs.writeFileSync(standaloneIndexPath, html);
console.log(`✓ Standalone HTML file created: ${standaloneIndexPath}`);
console.log('You can now open index-standalone.html directly in your browser!');
