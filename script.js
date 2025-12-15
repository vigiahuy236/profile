const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let target = { x: 0, y: 0 };
let tick = 0; 

const settings = {
    tentacles: 60,     
    length: 30,         
    radius: 10,         
    color: '#cc00ffff'   
};

class Tentacle {
    constructor(x, y, index) {
        this.length = settings.length;
        this.segments = [];
        this.angleOffset = (index * 0.1); 
        for (let i = 0; i < this.length; i++) {
            this.segments.push({
                x: x,
                y: y
            });
        }
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
        ctx.beginPath();
        ctx.moveTo(this.segments[0].x, this.segments[0].y);
        for (let i = 1; i < this.length - 1; i++) {
            const xc = (this.segments[i].x + this.segments[i + 1].x) / 2;
            const yc = (this.segments[i].y + this.segments[i + 1].y) / 2;
            ctx.quadraticCurveTo(this.segments[i].x, this.segments[i].y, xc, yc);
        }
        let last = this.segments[this.length - 1];
        ctx.lineTo(last.x, last.y);
        ctx.strokeStyle = settings.color;
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
    target.x = width / 2;
    target.y = height / 2;
}

function animate() {
    requestAnimationFrame(animate);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; 
    ctx.fillRect(0, 0, width, height);
    ctx.shadowBlur = 10;
    ctx.shadowColor = settings.color;
    tick++; 
    tentacles.forEach(tentacle => {
        tentacle.move(target.x, target.y);
        tentacle.draw(ctx);
    });
    ctx.shadowBlur = 0; 
}

window.addEventListener('resize', resize);
window.addEventListener('mousemove', (e) => {
    target.x = e.clientX;
    target.y = e.clientY;
});
window.addEventListener('touchmove', (e) => {
    target.x = e.touches[0].clientX;
    target.y = e.touches[0].clientY;
});

init();
animate();