const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let target = { x: 0, y: 0 };
let tick = 0;
let currentOpacity = 0; 
let targetOpacity = 0;  

const settings = {
    tentacles: 60,     
    length: 30,        
    radius: 10,        
    colorR: 204, 
    colorG: 0,   
    colorB: 255  
};

class Tentacle {
    constructor(x, y, index) {
        this.length = settings.length;
        this.segments = [];
        this.angleOffset = (index * 0.1); 
        for (let i = 0; i < this.length; i++) {
            this.segments.push({ x: x, y: y });
        }
    }

    reset(x, y) {
        this.segments.forEach(segment => {
            segment.x = x;
            segment.y = y;
        });
    }

    move(targetX, targetY) {
        let head = this.segments[0];
        head.x += (targetX - head.x) * 0.1; 
        head.y += (targetY - head.y) * 0.1;
        for (let i = 1; i < this.length; i++) {
            let prev = this.segments[i - 1];
            let curr = this.segments[i];
            let dx = prev.x - curr.x;
            let dy = prev.y - curr.y;
            let angle = Math.atan2(dy, dx);
            let wave = Math.sin(tick * 0.05 + i * 0.2 + this.angleOffset) * 0.5;
            let tx = prev.x - Math.cos(angle + wave) * (settings.radius * (1 - i/this.length * 0.5));
            let ty = prev.y - Math.sin(angle + wave) * (settings.radius * (1 - i/this.length * 0.5));
            curr.x += (tx - curr.x) * 0.4; 
            curr.y += (ty - curr.y) * 0.4;
        }
    }

    draw(ctx) {
        if (currentOpacity < 0.01) return;

        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.length - 1; i++) {
            const xc = (this.segments[i].x + this.segments[i + 1].x) / 2;
            const yc = (this.segments[i].y + this.segments[i + 1].y) / 2;
            ctx.quadraticCurveTo(this.segments[i].x, this.segments[i].y, xc, yc);
        }
        let last = this.segments[this.length - 1];
        ctx.lineTo(last.x, last.y);
        
        ctx.strokeStyle = `rgba(${settings.colorR}, ${settings.colorG}, ${settings.colorB}, ${currentOpacity})`;
        ctx.lineWidth = 1.5;        
        ctx.stroke();
        ctx.closePath();
    }
}

let tentacles = [];

function init() {
    resize();
    tentacles = [];
    for (let i = 0; i < settings.tentacles; i++) {
        tentacles.push(new Tentacle(width / 2, height / 2, i));
    }
}

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}

function animate() {
    requestAnimationFrame(animate);
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.fillStyle = 'rgba(22, 22, 22, 0.2)'; 
    ctx.fillRect(0, 0, width, height);
    currentOpacity += (targetOpacity - currentOpacity) * 0.05;
    if (currentOpacity > 0.01) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(${settings.colorR}, ${settings.colorG}, ${settings.colorB}, ${currentOpacity})`;
    }
    
    tick++; 
    tentacles.forEach(tentacle => {
        tentacle.move(target.x, target.y);
        tentacle.draw(ctx);
    });
}

window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    if (targetOpacity === 0) {
        target.x = e.clientX;
        target.y = e.clientY;
        tentacles.forEach(t => t.reset(target.x, target.y));
    }
    targetOpacity = 1;
    target.x = e.clientX;
    target.y = e.clientY;
});

document.addEventListener('mouseleave', () => {
    targetOpacity = 0;
});

document.addEventListener('mouseenter', (e) => {
    targetOpacity = 1;
    target.x = e.clientX;
    target.y = e.clientY;
    tentacles.forEach(t => t.reset(target.x, target.y));
});

window.addEventListener('touchmove', (e) => {
    if (targetOpacity === 0) {
        target.x = e.touches[0].clientX;
        target.y = e.touches[0].clientY;
        tentacles.forEach(t => t.reset(target.x, target.y));
    }
    targetOpacity = 1;
    target.x = e.touches[0].clientX;
    target.y = e.touches[0].clientY;
});

window.addEventListener('touchend', () => {
    targetOpacity = 0;
});

init();
animate();