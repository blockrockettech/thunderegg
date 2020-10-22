let tokenData = {
  hashes:["0x3f8C962eb167aD2f80C72b5F933511CcDF0719D4"]
}

let age = [200, 200, 5];
let lava = [211,6,167];
let univ2 = [33,22,167];

let numHashes = tokenData.hashes.length;
let hashPairs = [];

for (let i = 0; i<numHashes; i++){
  for (let j=0; j<32; j++){
    hashPairs.push(tokenData.hashes[i].slice(2+(j*2), 4+(j*2)));
  }
}

let hashData = hashPairs.map(x=>parseInt(x,16));

let colorA;
let colorB;
let colorC;
function setup() {
  createCanvas(windowWidth, windowHeight);

  setGradient(
    color([hashData[0],hashData[1],hashData[2]]),
    color([hashData[3],hashData[4],hashData[5]])
  );

  colorA = color(age);
  colorB = color(univ2);
  colorC = color(lava);
}

function draw() {
  for (let i=100;i>0;i--){
    let fillColor;
    noStroke();
    if (i<50){
      fillColor = lerpColor(colorA, colorB, i*2/100);
    } else {
      fillColor = lerpColor(colorB, colorC, (i-(100-i))/100);
    }
    fill(fillColor);
    push();
    translate(width*.5, height+i*2-200);
    scale(i/15);
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

function setGradient(c1, c2) {
  // noprotect
  noFill();
  for (var y = 0; y < height; y++) {
    var inter = map(y, 0, height, 0, 1);
    var c = lerpColor(c1, c2, inter);
    stroke(c);
    line(0, y, width, y);
  }
}