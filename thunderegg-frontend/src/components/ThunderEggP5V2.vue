<template>
    <div :id="`egg-${eggId}`"></div>
</template>

<script>
  import P5 from 'p5';

  import {onMounted} from 'vue';

  export default {
    props: ['eggId', 'owner', 'lava', 'lpStones', 'birth', 'name', 'age'],

    setup(props) {
      const sketch = (s) => {
        let hashPairs = [];
        for (let j = 0; j < 32; j++) {
          hashPairs.push(props.owner.slice(2 + (j * 2), 4 + (j * 2)));
        }

        let decPairs = hashPairs.map(x => parseInt(x, 16));

        // eslint-disable-next-line no-unused-vars
        let age = props.age;
        // eslint-disable-next-line no-unused-vars
        let step = 0;
        // eslint-disable-next-line no-unused-vars
        let increase = true;
        // eslint-disable-next-line no-unused-vars
        let colorA;
        // eslint-disable-next-line no-unused-vars
        let colorB;
        // eslint-disable-next-line no-unused-vars
        let colorC;
        // eslint-disable-next-line no-unused-vars
        let unit;
        // eslint-disable-next-line no-unused-vars
        let brightness = age / 3000 * 128;

        // eslint-disable-next-line no-unused-vars
        let height = 400;
        let width = 400;

        s.setup = () => {
          s.createCanvas(height, width);

          s.colorMode(s.HSB, 255);
          s.background(200);
          colorA = s.color(step, 255, 255);
          colorB = s.color(s.map(decPairs[2], 0, 255, 15, 60), 255 - brightness, 255 - brightness);
          colorC = s.color(s.map(decPairs[3], 0, 255, 60, 15), 255 - brightness, 255 - brightness);
          unit = s.width / 80;
        };

        s.draw = () => {
          for (let i = 100; i > 0; i--) {
            let fillColor;
            colorA = s.color(step, 255, 255);
            colorB = s.color(s.map(decPairs[2], 0, 255, 15, 60), 255 - brightness, 255 - brightness);
            colorC = s.color(s.map(decPairs[3], 0, 255, 60, 15), 255 - brightness, 255 - brightness);

            s.noStroke();
            if (i < 25) {
              fillColor = s.lerpColor(colorA, colorB, i * 4 / 100);
            } else {
              if (i === 100) {
                s.stroke("white");
              }
              fillColor = s.lerpColor(colorB, colorC, (i - (100 - i)) / 100);
            }
            s.fill(fillColor);
            s.push();

            s.translate(unit * 40, (height / 1.25) + (i * 0.25));
            s.scale(i / 25);
            s.beginShape();
            s.vertex(0, -unit * 10);
            s.bezierVertex(unit * 2.5, -unit * 10, unit * 4, -unit * 6.67, unit * 4, -unit * 4);
            s.bezierVertex(unit * 4, -unit * 1.67, unit * 2.5, 0, 0, 0);
            s.bezierVertex(-unit * 2.5, 0, -unit * 4, -unit * 1.67, -unit * 4, -unit * 4);
            s.bezierVertex(-unit * 4, -unit * 6.67, -unit * 2.5, -unit * 10, 0, -unit * 10);
            s.endShape();
            s.pop();
          }

          //spots

          s.push();
          s.translate(unit * 40 - s.map(decPairs[31], 0, 255, 0, unit * 5), unit * 40 - s.map(decPairs[30], 0, 255, unit * 3, unit * 5));
          //scale(1);
          s.scale(s.map(decPairs[0], 0, 255, .02, .05) + age / 60000);
          s.rotate(s.radians(s.map(decPairs[1], 0, 255, 0, 90)) + age / 500);

          s.fill(0, 0, 90, age / 3000 * 128);
          s.noStroke();
          s.beginShape();
          s.vertex(-unit * 20 - s.map(decPairs[5], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[6], 0, 255, 0, 50));
          s.bezierVertex(s.map(decPairs[7], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[8], 0, 255, 0, 50), s.map(decPairs[9], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[10], 0, 255, 0, 50), unit * 20, -unit * 20);
          s.bezierVertex(unit * 40 + s.map(decPairs[15], 0, 255, 0, 50), -s.map(decPairs[16], 0, 255, 0, 50), unit * 40 + s.map(decPairs[18], 0, 255, 0, 50), s.map(decPairs[19], 0, 255, 0, 50), unit * 20, unit * 20);
          s.bezierVertex(s.map(decPairs[20], 0, 255, 0, 50), unit * 40 - s.map(decPairs[21], 0, 255, 0, 50), -s.map(decPairs[22], 0, 255, 0, 50), unit * 40 - s.map(decPairs[23], 0, 255, 0, 50), -unit * 20, unit * 20);
          s.bezierVertex(-unit * 40 - s.map(decPairs[13], 0, 255, 0, 50), 0 - s.map(decPairs[11], 0, 255, 0, 50), -unit * 40 - s.map(decPairs[12], 0, 255, 0, 50), s.map(decPairs[14], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[5], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[6], 0, 255, 0, 50));
          s.endShape();
          s.pop();

          s.push();
          s.translate(unit * 40 - s.map(decPairs[15], 0, 255, unit * 5, unit * 10), unit * 40 - s.map(decPairs[16], 0, 255, 0, unit * 1.5));
          //scale(1);
          s.scale(s.map(decPairs[1], 0, 255, .02, .05) + age / 60000);
          s.rotate(s.radians(s.map(decPairs[2], 0, 255, 0, 90)) + age / 500);

          s.fill(0, 0, 90, age / 3000 * 128);
          s.noStroke();
          s.beginShape();
          s.vertex(-unit * 20 - s.map(decPairs[9], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[30], 0, 255, 0, 50));
          s.bezierVertex(s.map(decPairs[22], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[23], 0, 255, 0, 50), s.map(decPairs[31], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[1], 0, 255, 0, 50), unit * 20, -unit * 20);
          s.bezierVertex(unit * 40 + s.map(decPairs[11], 0, 255, 0, 50), -s.map(decPairs[3], 0, 255, 0, 50), unit * 40 + s.map(decPairs[9], 0, 255, 0, 50), s.map(decPairs[8], 0, 255, 0, 50), unit * 20, unit * 20);
          s.bezierVertex(s.map(decPairs[16], 0, 255, 0, 50), unit * 40 - s.map(decPairs[16], 0, 255, 0, 50), -s.map(decPairs[25], 0, 255, 0, 50), unit * 40 - s.map(decPairs[22], 0, 255, 0, 50), -unit * 20, unit * 20);
          s.bezierVertex(-unit * 40 - s.map(decPairs[12], 0, 255, 0, 50), 0 - s.map(decPairs[17], 0, 255, 0, 50), -unit * 40 - s.map(decPairs[18], 0, 255, 0, 50), s.map(decPairs[19], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[14], 0, 255, 0, 75), -unit * 20 - s.map(decPairs[29], 0, 255, 0, 25));
          s.endShape();
          s.pop();

          s.push();
          s.translate(unit * 40 - s.map(decPairs[15], 0, 255, -unit * 2, -unit * 10), unit * 40 - s.map(decPairs[16], 0, 255, -unit, -unit * 5));
          //scale(1);
          s.scale(s.map(decPairs[2], 0, 255, .02, .05) + age / 60000);
          s.rotate(s.radians(s.map(decPairs[3], 0, 255, 0, 90)) + age / 500);

          s.fill(0, 0, 90, age / 3000 * 128);
          s.noStroke();
          s.beginShape();
          s.vertex(-unit * 20 - s.map(decPairs[9], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[8], 0, 255, 0, 50));
          s.bezierVertex(s.map(decPairs[1], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[0], 0, 255, 0, 50), s.map(decPairs[4], 0, 255, 0, 50), -unit * 40 + s.map(decPairs[3], 0, 255, 0, 50), unit * 20, -unit * 20);
          s.bezierVertex(unit * 40 + s.map(decPairs[4], 0, 255, 0, 50), -s.map(decPairs[5], 0, 255, 0, 50), unit * 40 + s.map(decPairs[6], 0, 255, 0, 50), s.map(decPairs[7], 0, 255, 0, 50), unit * 20, unit * 20);
          s.bezierVertex(s.map(decPairs[8], 0, 255, 0, 50), unit * 40 - s.map(decPairs[9], 0, 255, 0, 50), -s.map(decPairs[10], 0, 255, 0, 50), unit * 40 - s.map(decPairs[11], 0, 255, 0, 50), -unit * 20, unit * 20);
          s.bezierVertex(-unit * 40 - s.map(decPairs[21], 0, 255, 0, 50), 0 - s.map(decPairs[22], 0, 255, 0, 50), -unit * 40 - s.map(decPairs[23], 0, 255, 0, 50), s.map(decPairs[24], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[25], 0, 255, 0, 50), -unit * 20 - s.map(decPairs[26], 0, 255, 0, 50));
          s.endShape();
          s.pop();

          s.stroke("white");
          s.strokeWeight(2);
          s.noFill();
          s.push();

          s.translate(unit * 40, (height / 1.25) + (100 * 0.25));
          s.scale(100 / 25);
          s.beginShape();
          s.vertex(0, -unit * 10);
          s.bezierVertex(unit * 2.5, -unit * 10, unit * 4, -unit * 6.67, unit * 4, -unit * 4);
          s.bezierVertex(unit * 4, -unit * 1.67, unit * 2.5, 0, 0, 0);
          s.bezierVertex(-unit * 2.5, 0, -unit * 4, -unit * 1.67, -unit * 4, -unit * 4);
          s.bezierVertex(-unit * 4, -unit * 6.67, -unit * 2.5, -unit * 10, 0, -unit * 10);
          s.endShape();

          let xr = s.bezierPoint(0, unit * 2.5, unit * 4, unit * 4, s.map(decPairs[11], 0, 255, 0.25, 0.75));
          let yr = s.bezierPoint(-unit * 10, -unit * 10, -unit * 6.67, -unit * 4, s.map(decPairs[11], 0, 255, 0.25, 0.75));

          let xl = s.bezierPoint(0, -unit * 2.5, -unit * 4, -unit * 4, s.map(decPairs[12], 0, 255, .25, .75));
          let yl = s.bezierPoint(-unit * 10, -unit * 10, -unit * 6.67, -unit * 4, s.map(decPairs[12], 0, 255, .25, .75));

          let radians1 = s.map(decPairs[31], 0, 255, 0, -65);
          let radians2 = radians1 + s.map(decPairs[0], 0, 255, -15, -50);
          let radians3 = radians2 - s.map(decPairs[1], 0, 255, 30, 40);
          let radians4 = radians3 + s.map(decPairs[2], 0, 255, 10, 35);

          let xr1 = xr - unit * s.map(decPairs[13], 0, 255, 1, 2) * (age < 1000 ? age / 1000 : 1) * s.cos(s.radians(radians1));
          let yr1 = yr - unit * s.map(decPairs[13], 0, 255, 1, 2) * (age < 1000 ? age / 1000 : 1) * s.sin(s.radians(radians1));
          let xr2 = xr1 - unit * s.map(decPairs[14], 0, 255, 0.5, 1.5) * (age > 1000 && age < 2000 ? (age / 1001) % 1 : age > 1000 && age > 2000 ? 1 : 0) * s.cos(s.radians(radians2));
          let yr2 = yr1 - unit * s.map(decPairs[14], 0, 255, 0.5, 1.5) * (age > 1000 && age < 2000 ? (age / 1001) % 1 : age > 1000 && age > 2000 ? 1 : 0) * s.sin(s.radians(radians2));
          let xr3 = xr2 - unit * s.map(decPairs[15], 0, 255, 0.5, 1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.cos(s.radians(radians3));
          let yr3 = yr2 - unit * s.map(decPairs[15], 0, 255, 0.5, 1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.sin(s.radians(radians3));
          let xr4 = xr2 - unit * s.map(decPairs[16], 0, 255, 0.5, 1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.cos(s.radians(radians4));
          let yr4 = yr2 - unit * s.map(decPairs[16], 0, 255, 0.5, 1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.sin(s.radians(radians4));

          s.strokeWeight(unit / s.map(decPairs[0], 0, 255, 4, 8));
          s.line(xr, yr, xr1, yr1);
          s.line(xr1, yr1, xr2, yr2);
          s.line(xr2, yr2, xr3, yr3);
          s.line(xr2, yr2, xr4, yr4);

          let radians5 = s.map(decPairs[1], 0, 255, 0, -65);
          let radians6 = radians5 + s.map(decPairs[3], 0, 255, -15, -50);
          let radians7 = radians6 - s.map(decPairs[4], 0, 255, 30, 40);
          let radians8 = radians7 + s.map(decPairs[5], 0, 255, 10, 35);

          let xl1 = xl + unit * s.map(decPairs[17], 0, 255, 1, 2) * (age < 1000 ? age / 1000 : 1) * s.cos(s.radians(radians5));
          let yl1 = yl - unit * s.map(decPairs[17], 0, 255, 1, 2) * (age < 1000 ? age / 1000 : 1) * s.sin(s.radians(radians5));
          let xl2 = xl1 + unit * s.map(decPairs[18], 0, 255, 0.5, 1.5) * (age > 1000 && age < 2000 ? (age / 1001) % 1 : age > 1000 && age > 2000 ? 1 : 0) * s.cos(s.radians(radians6));
          let yl2 = yl1 - unit * s.map(decPairs[18], 0, 255, 0.5, 1.5) * (age > 1000 && age < 2000 ? (age / 1001) % 1 : age > 1000 && age > 2000 ? 1 : 0) * s.sin(s.radians(radians6));
          let xl3 = xl2 - unit * s.map(decPairs[19], 0, 255, 0.5, 1.25) * (age > 2001 ? (age / 1001) % 1 : 0) * s.cos(s.radians(radians7));
          let yl3 = yl2 - unit * s.map(decPairs[19], 0, 255, 0.5, 1.25) * (age > 2001 ? (age / 1001) % 1 : 0) * s.sin(s.radians(radians7));
          let xl4 = xl2 - unit * s.map(decPairs[20], 0, 255, 1, 1.1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.cos(s.radians(radians8));
          let yl4 = yl2 - unit * s.map(decPairs[20], 0, 255, 1, 1.1) * (age > 2001 ? (age / 1001) % 1 : 0) * s.sin(s.radians(radians8));


          s.strokeWeight(unit / s.map(decPairs[25], 0, 255, 4, 8));
          s.line(xl, yl, xl1, yl1);
          s.line(xl1, yl1, xl2, yl2);
          s.line(xl2, yl2, xl3, yl3);
          s.line(xl2, yl2, xl4, yl4);

          s.pop();

          if (step > 40) {
            increase = false;
          } else if (step <= 15) {
            increase = true;
          }

          if (step >= 0 && increase == true) {
            step = step + 0.15;
          } else if (increase == false) {
            step = step - 0.15;
          }
        };
      };

      onMounted(async () => {
        new P5(sketch, `egg-${props.eggId}`);
      });
    },
  };
</script>