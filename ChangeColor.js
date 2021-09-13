const orgColors = {
    walls: '#578a34',
    shadows: '#94bd46',
    lightTiles: '#a2d149',
    darkTiles: '#aad751'
}

const darkMode = {
    walls: '#000',
    shadows: '#000',
    lightTiles: '#353536',
    darkTiles: '#2b2b2b',
    
    LSD: true
}

var selectedMode = darkMode;

/* Overriding the fillRect function */
var oldFillRect = CanvasRenderingContext2D.prototype.fillRect;
CanvasRenderingContext2D.prototype.fillRect = function() { 
    
    for(const color in orgColors) {
        if(this.fillStyle === orgColors[color]) {
            this.fillStyle = selectedMode[color];
        }
    }
    
    oldFillRect.apply(this, arguments);
}

/* Overriding the drawImage function */
var oldDrawImage = CanvasRenderingContext2D.prototype.drawImage;
CanvasRenderingContext2D.prototype.drawImage = function() {
    
    if(arguments[0].tagName === 'CANVAS') {
        /* Drawing the canvas */
        
        /* Applying the filters */
        
        if(selectedMode.LSD) {
            hue = new Date() / 10;
            this.filter = 'hue-rotate(' + (hue % 360) + 'deg)';
        }
        
        oldDrawImage.apply(this, arguments);
    } else {
        /* Drawing a sprite/image */
        oldDrawImage.apply(this, arguments); 
    }
    
    /* Clearing the filter after rendering */
    this.filter = '';
}
