const hslToRgb = (h, s, l) => {
  s /= 100;
  l /= 100;
  const k = n => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [
    Math.round(255 * f(0)),
    Math.round(255 * f(8)),
    Math.round(255 * f(4)),
  ];
};

function split(hex) {
  let b = hex % 256;
  hex >>= 8;

  let g = hex % 256;
  hex >>= 8;

  let r = hex % 256;
  return [r, g, b];
}


export class Color {
  constructor(hsl) {
    this.hsl = hsl;
    this.rgb = hslToRgb(this.hsl[0], this.hsl[1], this.hsl[2]);
    this.hex = (256*256)*this.rgb[0] + (256)*this.rgb[1] + this.rgb[2];
  }

  getHex() {
    return this.hex.toString(16);
  }
}