<template>
    <div :id="eggId" style="height: 400px; width: 400px;"></div>
</template>

<script>
  import P5 from 'p5';

  export default {
    props: ['eggId', 'owner'],
    created() {
      const sketch = (s) => {

        let hashPairs = [];

        for (let j = 0; j < 32; j++) {
          hashPairs.push(this.owner.slice(2 + (j * 2), 4 + (j * 2)));
        }

        let hashData = hashPairs.map(x => {
          return parseInt(x, 16);
        });

        let colorA;
        let colorB;
        let colorC;

        let height = 400;
        let width = 400;

        s.setup = () => {
          // Create the canvas
          s.createCanvas(height, width);
          s.background(0);
          colorA = s.color([hashData[0], hashData[1], hashData[2]]);
          colorB = s.color([hashData[3], hashData[4], hashData[5]]);
          colorC = s.color([hashData[6], hashData[7], hashData[8]]);
        };

        s.draw = () => {
          for (let i = 100; i > 0; i--) {
            let fillColor;
            s.noStroke();
            if (i < 50) {
              fillColor = s.lerpColor(colorA, colorB, i * 2 / 100);
            } else {
              fillColor = s.lerpColor(colorB, colorC, (i - (100 - i)) / 100);
            }
            s.fill(fillColor);
            s.push();
            s.translate(width * .5, height + i * 2 - 250);
            s.scale(i / 15);
            s.beginShape();
            s.vertex(0, -100);
            s.bezierVertex(25, -100, 40, -65, 40, -40);
            s.bezierVertex(40, -15, 25, 0, 0, 0);
            s.bezierVertex(-25, 0, -40, -15, -40, -40);
            s.bezierVertex(-40, -65, -25, -100, 0, -100);
            s.endShape();
            s.pop();
          }
          s.translate(width * .5, height + 100 * 2 - 250);
          s.scale(100 / 15);
          let x = s.bezierPoint(0, 25, 40, 40, 0.5);
          let y = s.bezierPoint(-100, -100, -65, -40, 0.5);
          s.stroke(255);
          s.noFill();
          s.beginShape();
          s.vertex(x - .5, y);
          s.vertex(20, -60);
          s.vertex(10, -70);
          s.endShape();
        };
      };

      new P5(sketch, this.eggId);
    }
  };
</script>