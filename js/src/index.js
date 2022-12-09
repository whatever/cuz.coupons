import {default as CanCoverPage} from "./pages/01-can.js";
import {TribalPage} from "./pages/02-tribals.js";
import {LorenzPage} from "./pages/03-lorenz.js";
import {SudokuPage} from "./pages/07-sudoku.js";

import {default as Stats} from "stats.js";

var stats = new Stats();

import {getScrollPercent, isInViewport, position} from "./utils.js";

const PAGES = new Array(16);

const RENDER = [];

export class NoApp {
  constructor() {}
  update() {}
  draw() {}
  on() {}
}

/**
 *
 */
function Init(seed) {

  // Initialize with empty apps
  for (let i=0; i < PAGES.length; i++) {
    if (PAGES[i] && PAGES[i].clear) {
      PAGES[i].clear();
    }

    PAGES[i] = new NoApp();
  }

  // Fill in cover page
  PAGES[0] = CanCoverPage(seed);
  PAGES[1] = new TribalPage(document.getElementById("page-02"), seed);
  PAGES[2] = new LorenzPage(document.getElementById("page-03"), seed);
  PAGES[6] = new SudokuPage(document.getElementById("page-07"), seed);

  // When ready add to render list
  PAGES[0].on("loaded", function() {
    RENDER.push(this);
    PAGES[0].update();
    PAGES[0].draw();
  }.bind(PAGES[0]));

  RENDER.push(PAGES[2]);
}


// Interpolate between to vec3 points
function interpolat3(start, end, t) {
  let [x0, y0, z0] = start;
  let [x1, y1, z1] = end;
  let x = x0 + t*(x1-x0);
  let y = y0 + t*(y1-y0);
  let z = z0 + t*(z1-z0);
  return [Math.floor(x), Math.floor(y), Math.floor(z)];
}

function randomString() {
  let s = "";
  for (let i=0; i < 10; i++) {
    s += String.fromCharCode(65 + 26*Math.random());
  }
  return s;
}

let KEY = "cuz.coupons-seed";

/**
 * Get Seed
 *
 * Return a seed...
 */
function getSeed() {

  if (localStorage.getItem(KEY) === null) {
    localStorage.setItem(KEY, randomString());
  }

  return localStorage.getItem(KEY);
}

function setSeed(val) {
  localStorage.setItem(KEY, val);
}


window.addEventListener("load", () => {

  document.body.appendChild( stats.dom );

  document.getElementById("seed").value = getSeed();

  document.getElementById("seed").addEventListener("change", (ev) => {
    setSeed(ev.target.value);
    Init(getSeed());
  });


  // Initialize and setup render loop
  // ...
  // ...


  Init(getSeed());

  // Start render loop
  (function animate() {

    requestAnimationFrame(animate);

    stats.begin();

    RENDER.forEach((app) => {
      if (isInViewport(app.el)) {
        app.update();
        app.draw();
      }
    });

    let v = (+new Date() / 1000.0 / 800.0) % 1.0;
    PAGES[2].app.adjust(v);
    stats.end();
  }());

  let page01 = document.getElementById("page-01");

  let meow = document.getElementById("meow");

  // scroll
  window.addEventListener("scroll", handleScroll);

  function handleScroll() {
    const v = interpolat3(
      [255, 165, 0],
      [255, 255,255],
      getScrollPercent(),
    );
    const c = "rgb(" + v.join(", ") + ")";
    document.querySelector("HTML").style.scrollbarColor = c + " transparent";

    // SMOOTH THIS OUT
    const box01 = page01.getBoundingClientRect();
    const box03 = document.getElementById("page-03").getBoundingClientRect();

    let d = Math.min(Math.max(-box01.top, 0)/box01.height, 1.0);

    if (PAGES[0].setCrush) {
      PAGES[0].setCrush(d);
    }

    if (PAGES[2].app.setRotation) {

      let h = window.innerHeight;
      let top = box03.height;

      // f(h) = 0.0
      // f(-top) = 1.0
      //
      // x*h   + b = 0.0
      // x*-top + b = 1.0
      // x*-top + -x*h = 1.0
      // -x*(top+h) = 1.0
      //
      // [
      //   h    1     0.0
      //  -t    1     1.0
      //  ]
      //
      // x = -1.0/(top+h)
      // b = -x*h
      //
      //

      let x = box03.top;

      let pct = -1.0/(h+top) * x + h/(h+top);
      pct = Math.min(pct, 1.0);
      pct = Math.max(pct, 0.0);

      // f(box03.height) = 0.0
      // f(-box03.height) = 1.0
      let e = Math.min(Math.max(-box03.top, 0)/box03.height, 1.0);
      let u = getScrollPercent();
      PAGES[2].app.setRotation(Math.PI*pct);
      // PAGES[2].app.adjust(pct/12.0);
    }
  }

  handleScroll()

});
