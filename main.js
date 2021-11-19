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

/* Color changing mods */
const orgColors = {
    walls: '#578a34',
    shadows: '#94bd46',
    lightTiles: '#a2d149',
    darkTiles: '#aad751'
}

var colors = {
    walls: '#578a34',
    shadows: '#94bd46',
    lightTiles: '#a2d149',
    darkTiles: '#aad751'
}

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
const percentReg = '[0-9]+%';
const degReg = '[0-9]+deg';

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