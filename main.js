/* Copyright (c) 2021 Skagenmacka */

/* If youre forking the repository, change this to your own repository.
 * It should be https://raw.githubusercontent.com/YOUR_USERNAME/REPOSITORY_NAME/BRANCH/ 
 * Note: Your repository needs to be public, which it should be anyway.
 */
const baseUrl = 'https://raw.githubusercontent.com/skagenmacka/snake/main/';

/* Helper functions */
function get(url, cb) {
    var req = new XMLHttpRequest();
    
    req.onreadystatechange = () => { 
        if(req.readyState == 4 && req.status == 200){
            cb(req.responseText);
        }
    }
    
    req.open('GET', url, true);
    req.send(null);
}

/* Very unaccurate, but works */
function hexToFilter(hex) {
    
    hex = hex.slice(1);
    let len = hex.length;
    
    console.log(len);
    
    /* rgba */
    let rgb = [ 255, 255, 255, 255 ];
    
    let regex = undefined;
    let shortcut = false;
    
    /* hex -> rgb */
    if(len === 3 || len === 4) {
        regex = /[0-9a-fA-F]/g;
        shortcut = true;
    } else if(len === 6 || len === 8) {
        regex = /[0-9a-fA-F]{2}/g;
    }
    
    /* Not valid */
    if(regex === undefined) { return ''; }
    
    let matches = [...hex.matchAll(regex)];
    matches.forEach((match, i) => {
        rgb[i] = parseInt(match[0].repeat(shortcut ? 2 : 1), 16);
    });
    
    /* rgb -> hsl */
    hsl = [ 0, 0, 0 ];
    
    for(let i = 0; i < 3; i++) {
        rgb[i] /= 255;
    }
    
    let min = Math.min(rgb[0], rgb[1], rgb[2]);
    let max = Math.max(rgb[0], rgb[1], rgb[2]);
    let delta = max - min;
    
    if(delta !== 0) {
    if(max === rgb[0]) {
            hsl[0] = 0 + (rgb[1] - rgb[2]) / delta;
        } else if(max === rgb[1]) {
            hsl[0] = 2 + (rgb[2] - rgb[0]) / delta;
        } else if(max === rgb[2]) {
            hsl[0] = 4 + (rgb[0] - rgb[1]) / delta;
        }
    }
    
    hsl[0] *= 60;
    hsl[0] = (hsl[0] + 360) % 360;
    
    hsl[2] = (max + min) / 2;
    hsl[1] = delta == 0 ? 0 : delta / (1 - Math.abs(2 * hsl[2] - 1));
    
    hsl[1] = Math.round(hsl[1]);
    hsl[2] = Math.round(hsl[2]);
    
    /* This will create a red base to start of with 
     * invert(50%) will make any image or icon completely gray.
     * sepia(100%) will give the image a slight yellow-orange tint.
     * saturate(10000%) will boost the yellow-orange tint so that it becomes red (#f00).
     */
    let filter = 'invert(50%) sepia(100%) saturate(10000%) ';
    
    /* Applying the hue, saturation and lightness */
    filter += `hue-rotate(${hsl[0]}deg) saturate(${200 - hsl[1]}%) brightness(${50 + hsl[2]}%)`;
    
    return filter;
}

/* Color changing mods */
const orgColors = {
    walls: '#578a34',
    shadows: '#94bd46',
    lightTiles: '#a2d149',
    darkTiles: '#aad751',
    
    bar: '#4a752c',
    text: '#fffff'
}

/* Overriding the css colors */
let bar = document.getElementsByClassName('sEOCsb')[0];
let text = [...bar.getElementsByClassName('HIonyd')].concat([...bar.getElementsByClassName('A2vT0')]);
let icons = [...document.getElementsByClassName('fkOrwb')[0].getElementsByTagName('img')];

const colorProxy = {
    set(obj, prop, value) {
        obj[prop] = value;
        
        if(prop === 'bar' || prop === 'text') { 
            /* Applying the top bars color */
            bar.style.backgroundColor = obj.bar;
            
            /* Applying the text color */
            text.forEach(elm => {
                elm.style.color = obj.text;
            });
            
            /* Applying the filters on the images */
            const filter = hexToFilter(obj.text);
            icons.forEach(elm => {
                elm.style.filter = filter;
            });
        }
        
        return true;
    }
}

var colors = new Proxy({
    walls: '#578a34',
    shadows: '#94bd46',
    lightTiles: '#a2d149',
    darkTiles: '#aad751',
    
    bar: '#4a752c',
    text: '#fffff'
}, colorProxy);

/* Overriding the fillRect function, to recolor the tiles */
var oldFillRect = CanvasRenderingContext2D.prototype.fillRect;
CanvasRenderingContext2D.prototype.fillRect = function() { 
    for(const color in orgColors) {
        if(this.fillStyle === orgColors[color]) {
            this.fillStyle = colors[color];
        }
    }
    
    oldFillRect.apply(this, arguments);
}



/* Mods using filters */
filters = {
    'blur': undefined,
    'hue-rotate': undefined,
    'contrast': undefined
};

function blur(str) {
    filters['blur'] = str;
}

function hueRotate(str) {
    filters['hue-rotate'] = str;
}

function contrast(str) {
    filters['contrast'] = str;
}

var oldDrawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function() {
    if(arguments[0].tagName === 'CANVAS') {
        /* Drawing a canvas */
        activeMods.forEach(mod => {
            if(mod.draw !== undefined) {
                mod.draw();
            }
        });
        
        var filter = '';
        
        /* Applying the filters */
        Object.keys(filters).forEach((key) => {
            if(filters[key] !== undefined) {
                filter += key + '(' + filters[key] + ') ';
            }
        });
        
        this.filter = filter;
    }
    
    oldDrawImage.apply(this, arguments);
    
    /* Clearing the filter after rendering */
    this.filter = '';
}


/* Loading the mods */
var modsPaths = [ 'color-changer', 'lsd' ];

var activeMods = [];

var curMod = undefined;
modsPaths.forEach(mod => {
    
    let path = `${baseUrl}mods/${mod}/`;
    
    /* Loading the json file associated with the mod */
    get(path + 'mod.json', (text) => {
        let json = JSON.parse(text);
        
        /* Getting the mod script and executing it */
        get(path + json.main, (script) => {
            eval(script);
            
            var mod = Mod();
           
            if(mod !== undefined) {
                /* Adding the mod to the list */
                activeMods.push(mod);
            }
            
        });
        
        console.log('Loaded mod ' + json.name);
    });
});