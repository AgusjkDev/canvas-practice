import { random } from "./utils";

const $canvas = document.querySelector("canvas");
if (!$canvas) throw new Error("Canvas not found");

const canvas = {
    x: 0,
    y: 0,
    dx: 0.008,
    dy: 0.008,
};
$canvas.width = window.innerWidth;
$canvas.height = window.innerHeight;
window.addEventListener("resize", ({ target }) => {
    const window = target as Window;
    $canvas.width = window.innerWidth;
    $canvas.height = window.innerHeight;
});

const ctx = $canvas.getContext("2d");
if (!ctx) throw new Error("Canvas 2d context not found");

const mouse = {
    x: $canvas.width / 2,
    y: $canvas.height / 2,
};
window.addEventListener("mousemove", ({ clientX, clientY }) => {
    mouse.x = clientX;
    mouse.y = clientY;
});

const MAP_SIZE = 5000;
const GRID_SIZE = 250;

function update($canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
    requestAnimationFrame(() => update($canvas, ctx));

    ctx.clearRect(0, 0, $canvas.width, $canvas.height);
    ctx.save();

    const limit = MAP_SIZE / 2 - Player.r;
    if (mouse.x > Player.x) {
        canvas.x = Math.max(
            canvas.x - Math.min(mouse.x % Player.x, $canvas.height / 2) * canvas.dx,
            -limit
        );
    } else if (mouse.x < Player.x) {
        canvas.x = Math.min(
            canvas.x + Math.min(Player.x - mouse.x, $canvas.height / 2) * canvas.dx,
            limit
        );
    }
    if (mouse.y > Player.y) {
        canvas.y = Math.max(canvas.y - (mouse.y % Player.y) * canvas.dy, -limit);
    } else if (mouse.y < Player.y) {
        canvas.y = Math.min(canvas.y + (Player.y - mouse.y) * canvas.dy, limit);
    }

    ctx.translate(canvas.x, canvas.y);
    Grid.render(ctx);
    food = food.filter(entity => {
        const playerX = MAP_SIZE / 2 - canvas.x;
        const playerY = MAP_SIZE / 2 - canvas.y;
        const diff = Math.sqrt(Math.pow(entity.x - playerX, 2) + Math.pow(entity.y - playerY, 2));
        if (diff <= Player.r + entity.r / 3) {
            Player.r += 1 / 3;
            return false;
        }
        entity.render($canvas, ctx);
        return true;
    });

    ctx.restore();
    Player.render(ctx);
}

const Grid = {
    gap: GRID_SIZE,
    render: function (ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate($canvas.width / 2 - MAP_SIZE / 2, $canvas.height / 2 - MAP_SIZE / 2);

        for (let x = 0; x <= MAP_SIZE; x += this.gap) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, MAP_SIZE);
            ctx.stroke();

            for (let y = -MAP_SIZE / 2; y <= MAP_SIZE / 2; y += this.gap) {
                ctx.fillText(`y=${y}`, x, y + MAP_SIZE / 2);
            }
        }

        for (let y = 0; y <= MAP_SIZE; y += this.gap) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(MAP_SIZE, y);
            ctx.stroke();

            for (let x = -MAP_SIZE / 2; x <= MAP_SIZE / 2; x += this.gap) {
                ctx.fillText(`x=${x}`, x + MAP_SIZE / 2, y - 10);
            }
        }

        ctx.restore();
    },
};

const Player = {
    x: $canvas.width / 2,
    y: $canvas.height / 2,
    r: 25,
    render: function (ctx: CanvasRenderingContext2D) {
        this.x = $canvas.width / 2;
        this.y = $canvas.height / 2;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fill();
    },
};

class FoodEntity {
    public x: number;
    public y: number;
    public r: number;
    public color: string;

    constructor(x: number, y: number, r: number, color: string) {
        this.x = x;
        this.y = y;
        this.r = r;
        this.color = color;
    }

    public render($canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.translate($canvas.width / 2 - MAP_SIZE / 2, $canvas.height / 2 - MAP_SIZE / 2);

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, 2 * Math.PI);
        ctx.fillStyle = this.color;
        ctx.fill();

        ctx.restore();
    }
}

let food = Array.from(
    { length: 1000 },
    () => new FoodEntity(random(0, MAP_SIZE), random(0, MAP_SIZE), 4, "red")
);

update($canvas, ctx);
