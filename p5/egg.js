let er2;

function setup() {
  createCanvas(250, 250);
  er2 = new EggRing(width*.5, height*1, 0.05, 180, 256);
}

function draw() {
  background(0);
  er2.transmit();
}

class Egg {
  constructor(xpos, ypos, t, s, fill) {
    this.x = xpos;
    this.y = ypos;
    this.tilt = t;
    this.scalar = s / 100.0;
    this.angle = 0.0;
    this.fill = fill;
  }

  wobble() {
    this.tilt = cos(this.angle) / 8;
    this.angle += 0.025;
  }

  display() {
    noStroke();
    fill(this.fill);
    push();
    translate(this.x, this.y);
    rotate(this.tilt);
    scale(this.scalar);
    beginShape();
    vertex(0, -100);
    bezierVertex(25, -100, 40, -65, 40, -40);
    bezierVertex(40, -15, 25, 0, 0, 0);
    bezierVertex(-25, 0, -40, -15, -40, -40);
    bezierVertex(-40, -65, -25, -100, 0, -100);
    endShape();
    pop();
  }
}

class EggRing {
  constructor(x, y, t, sp, fill) {
    this.x = x;
    this.y = y;
    this.t = t;
    this.sp = sp;
    this.fill = fill;
    this.ovoid = new Egg(this.x, this.y, this.t, this.sp, this.fill);
  }

  transmit() {
    this.ovoid.wobble();
    this.ovoid.display();
  }
}
