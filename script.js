
document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const colorPicker = document.getElementById('colorPicker');
    const colorHex = document.getElementById('colorHex');
    const addColorBtn = document.getElementById('addColor');
    const paletteName = document.getElementById('paletteName');
    const savePaletteBtn = document.getElementById('savePalette');
    const clearPaletteBtn = document.getElementById('clearPalette');
    const currentPalette = document.getElementById('currentPalette');
    
    const baseColor = document.getElementById('baseColor');
    const baseColorHex = document.getElementById('baseColorHex');
    const paletteType = document.getElementById('paletteType');
    const generatePaletteBtn = document.getElementById('generatePalette');
    const generatedPalette = document.getElementById('generatedPalette');
    const generatedPaletteName = document.getElementById('generatedPaletteName');
    const saveGeneratedPaletteBtn = document.getElementById('saveGeneratedPalette');
    
    const palettesList = document.getElementById('palettesList');
    const notification = document.getElementById('notification');
    
    // Tab functionality
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
    
    // Load saved palettes from localStorage
    let palettes = JSON.parse(localStorage.getItem('colorPalettes')) || [];
    renderSavedPalettes();
    
    // Color picker sync
    colorPicker.addEventListener('input', function() {
        colorHex.value = this.value;
    });
    
    colorHex.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
            colorPicker.value = this.value;
        }
    });
    
    baseColor.addEventListener('input', function() {
        baseColorHex.value = this.value;
    });
    
    baseColorHex.addEventListener('input', function() {
        if (this.value.match(/^#[0-9A-Fa-f]{6}$/)) {
            baseColor.value = this.value;
        }
    });
    
    // Add color to current palette
    addColorBtn.addEventListener('click', function() {
        const color = colorHex.value;
        if (isValidColor(color)) {
            addColorToPalette(color, currentPalette);
            colorHex.value = colorPicker.value = color;
            showNotification('Color added to palette');
        } else {
            showNotification('Please enter a valid HEX color (e.g., #6A89A7)', 'error');
        }
    });
    
    // Save manual palette
    savePaletteBtn.addEventListener('click', function() {
        const name = paletteName.value.trim();
        const colors = Array.from(currentPalette.children).map(box => box.dataset.color);
        
        if (!name) {
            showNotification('Please enter a palette name', 'error');
            return;
        }
        
        if (colors.length === 0) {
            showNotification('Please add at least one color to the palette', 'error');
            return;
        }
        
        savePalette(name, colors);
        currentPalette.innerHTML = '';
        paletteName.value = '';
    });
    
    // Clear current palette
    clearPaletteBtn.addEventListener('click', function() {
        currentPalette.innerHTML = '';
        showNotification('Palette cleared');
    });
    
    // Generate color palette
    generatePaletteBtn.addEventListener('click', function() {
        const base = baseColorHex.value;
        if (!isValidColor(base)) {
            showNotification('Please enter a valid base color', 'error');
            return;
        }
        
        const type = paletteType.value;
        const colors = generateColorPalette(base, type);
        
        generatedPalette.innerHTML = '';
        colors.forEach(color => {
            addColorToPalette(color, generatedPalette);
        });
        
        showNotification(`${type.charAt(0).toUpperCase() + type.slice(1)} palette generated`);
    });
    
    // Save generated palette
    saveGeneratedPaletteBtn.addEventListener('click', function() {
        const name = generatedPaletteName.value.trim();
        const colors = Array.from(generatedPalette.children).map(box => box.dataset.color);
        
        if (!name) {
            showNotification('Please enter a palette name', 'error');
            return;
        }
        
        if (colors.length === 0) {
            showNotification('Please generate a palette first', 'error');
            return;
        }
        
        savePalette(name, colors);
        generatedPaletteName.value = '';
    });
    
    // Helper functions
    function isValidColor(color) {
        return /^#[0-9A-Fa-f]{6}$/.test(color);
    }
    
    function addColorToPalette(color, container) {
        const colorBox = document.createElement('div');
        colorBox.className = 'color-box';
        colorBox.style.backgroundColor = color;
        colorBox.dataset.color = color;
        colorBox.textContent = color;
        
        // Add tooltip
        const tooltip = document.createElement('div');
        tooltip.className = 'color-box-tooltip';
        tooltip.textContent = 'Click to copy';
        colorBox.appendChild(tooltip);
        
        // Click to copy functionality
        colorBox.addEventListener('click', function() {
            navigator.clipboard.writeText(color);
            showNotification(`Copied ${color} to clipboard`);
        });
        
        container.appendChild(colorBox);
    }
    
    function savePalette(name, colors) {
        // Add to saved palettes
        palettes.unshift({ name, colors }); // Add to beginning of array
        localStorage.setItem('colorPalettes', JSON.stringify(palettes));
        renderSavedPalettes();
        showNotification(`"${name}" palette saved!`);
        
        // Switch to saved palettes tab
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        document.querySelector('.tab[data-tab="saved"]').classList.add('active');
        document.getElementById('saved-tab').classList.add('active');
    }
    
    function renderSavedPalettes() {
        palettesList.innerHTML = '';
        
        if (palettes.length === 0) {
            palettesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-palette"></i>
                    <h3>No saved palettes yet</h3>
                    <p>Create or generate a palette to get started</p>
                </div>
            `;
            return;
        }
        
        palettes.forEach((palette, index) => {
            const paletteEl = document.createElement('div');
            paletteEl.className = 'palette-item';
            
            paletteEl.innerHTML = `
                <div class="palette-name">
                    <span>${palette.name}</span>
                    <small>${palette.colors.length} colors</small>
                </div>
                <div class="palette-colors" id="paletteColors-${index}"></div>
                <div class="palette-actions">
                    <button class="download-btn" data-index="${index}">
                        <i class="fas fa-download"></i> Download as TXT
                    </button>
                    <button class="btn-danger delete-btn" data-index="${index}">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;
            
            palettesList.appendChild(paletteEl);
            
            const colorsContainer = document.getElementById(`paletteColors-${index}`);
            palette.colors.forEach(color => {
                const colorBox = document.createElement('div');
                colorBox.className = 'color-box';
                colorBox.style.backgroundColor = color;
                colorBox.textContent = color;
                
                // Add tooltip
                const tooltip = document.createElement('div');
                tooltip.className = 'color-box-tooltip';
                tooltip.textContent = 'Click to copy';
                colorBox.appendChild(tooltip);
                
                // Click to copy functionality
                colorBox.addEventListener('click', function() {
                    navigator.clipboard.writeText(color);
                    showNotification(`Copied ${color} to clipboard`);
                });
                
                colorsContainer.appendChild(colorBox);
            });
        });
        
        // Add event listeners to download buttons
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.dataset.index;
                downloadPalette(palettes[index]);
            });
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                if (confirm('Are you sure you want to delete this palette?')) {
                    const index = this.dataset.index;
                    palettes.splice(index, 1);
                    localStorage.setItem('colorPalettes', JSON.stringify(palettes));
                    renderSavedPalettes();
                    showNotification('Palette deleted');
                }
            });
        });
    }
    
    function downloadPalette(palette) {
        const content = `Palette Name: ${palette.name}\nColors:\n${palette.colors.join('\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `${palette.name.replace(/\s+/g, '_')}_palette.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification(`"${palette.name}.txt" downloaded`);
    }
    
    function showNotification(message, type = '') {
        notification.querySelector('span').textContent = message;
        notification.className = 'notification';
        if (type === 'error') {
            notification.classList.add('error');
            notification.querySelector('i').className = 'fas fa-exclamation-circle';
        } else {
            notification.querySelector('i').className = 'fas fa-check-circle';
        }
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 3000);
    }
    
    // Color palette generation functions
    function generateColorPalette(baseColor, type) {
        const base = hexToHSL(baseColor);
        let colors = [];
        
        switch(type) {
            case 'complementary':
                colors = [
                    baseColor,
                    hslToHex({ h: (base.h + 180) % 360, s: base.s, l: base.l })
                ];
                break;
                
            case 'analogous':
                colors = [
                    hslToHex({ h: (base.h + 330) % 360, s: base.s, l: base.l }),
                    baseColor,
                    hslToHex({ h: (base.h + 30) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 60) % 360, s: base.s, l: base.l })
                ];
                break;
                
            case 'triadic':
                colors = [
                    baseColor,
                    hslToHex({ h: (base.h + 120) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 240) % 360, s: base.s, l: base.l })
                ];
                break;
                
            case 'tetradic':
                colors = [
                    baseColor,
                    hslToHex({ h: (base.h + 60) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 180) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 240) % 360, s: base.s, l: base.l })
                ];
                break;
                
            case 'monochromatic':
                colors = [
                    hslToHex({ h: base.h, s: base.s, l: Math.max(15, base.l - 30) }),
                    hslToHex({ h: base.h, s: base.s, l: Math.max(25, base.l - 15) }),
                    baseColor,
                    hslToHex({ h: base.h, s: base.s, l: Math.min(85, base.l + 15) }),
                    hslToHex({ h: base.h, s: base.s, l: Math.min(95, base.l + 30) })
                ];
                break;
                
            case 'splitComplementary':
                colors = [
                    baseColor,
                    hslToHex({ h: (base.h + 150) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 210) % 360, s: base.s, l: base.l }),
                    hslToHex({ h: (base.h + 180) % 360, s: base.s, l: Math.min(95, base.l + 20) })
                ];
                break;
        }
        
        return colors;
    }
    
    function hexToHSL(hex) {
        // Convert hex to RGB first
        let r = parseInt(hex.slice(1, 3), 16);
        let g = parseInt(hex.slice(3, 5), 16);
        let b = parseInt(hex.slice(5, 7), 16);
        
        // Then convert RGB to HSL
        r /= 255, g /= 255, b /= 255;
        let max = Math.max(r, g, b), min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;

        if (max == min) {
            h = s = 0; // achromatic
        } else {
            let d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h *= 60;
        }

        return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
    }
    
    function hslToHex(hsl) {
        let h = hsl.h;
        let s = hsl.s;
        let l = hsl.l;
        
        s /= 100;
        l /= 100;

        let c = (1 - Math.abs(2 * l - 1)) * s,
            x = c * (1 - Math.abs((h / 60) % 2 - 1)),
            m = l - c / 2,
            r = 0,
            g = 0,
            b = 0;

        if (0 <= h && h < 60) {
            r = c; g = x; b = 0;
        } else if (60 <= h && h < 120) {
            r = x; g = c; b = 0;
        } else if (120 <= h && h < 180) {
            r = 0; g = c; b = x;
        } else if (180 <= h && h < 240) {
            r = 0; g = x; b = c;
        } else if (240 <= h && h < 300) {
            r = x; g = 0; b = c;
        } else if (300 <= h && h < 360) {
            r = c; g = 0; b = x;
        }
        
        // Having obtained RGB, convert channels to hex
        r = Math.round((r + m) * 255).toString(16);
        g = Math.round((g + m) * 255).toString(16);
        b = Math.round((b + m) * 255).toString(16);

        // Prepend 0s if necessary
        if (r.length == 1) r = "0" + r;
        if (g.length == 1) g = "0" + g;
        if (b.length == 1) b = "0" + b;

        return "#" + r + g + b;
    }

    // Initialize with some colors
    addColorToPalette('#6A89A7', currentPalette);
    addColorToPalette('#BDDDFC', currentPalette);
    addColorToPalette('#88BDF2', currentPalette);
    addColorToPalette('#384959', currentPalette);
})