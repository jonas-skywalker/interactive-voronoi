class Particle {
  constructor(x, y, wiggling) {
    this.pos = createVector(x, y);
    this.seed = [x, y];
    this.selected = false;
    this.picked = false;
    this.size = 10;
    this.wiggle = wiggling;
  }
  
  display() {
    push();
    fill(255);
    if (this.selected || this.picked) {
      stroke(255, 0, 0);
    } else {
      stroke(0, 0, 0);
    }
    translate(this.pos.x, this.pos.y);
    circle(0, 0, this.size);
    pop();
  }
  
  update() {
    var touching
    if (this.selected && (mouseIsPressed || (touches.length > 0))) {
      this.picked = true;
      this.pos.x = mouseX;
      this.pos.y = mouseY;
    } else {
      this.picked = false;
    }
    const distance = (this.pos.x - mouseX)**2 + (this.pos.y - mouseY)**2
    if (distance < (this.size/2)**2) {
      this.selected = true;
    } else {
      this.selected = false;
    }
    
    if (this.wiggle) {
      let dx = 5*noise(0.005*frameCount + this.seed[0]) - 2.5 
      let dy = 5*noise(0.005*frameCount + this.seed[1]) - 2.5 
      this.pos.x = this.wrap(this.pos.x + dx, 0, width);
      this.pos.y = this.wrap(this.pos.y + dy, 0, height);
    }
    
    for (let touch of touches) {
      const distance = (this.pos.x - touch.x)**2 + (this.pos.y - touch.y)**2
      if (distance < (this.size/2)**2) {
        this.selected = true;
      } else {
        this.selected = false;
      }
    }
  }
  
  wrap(x, minval, maxval) {
    let range = maxval - minval;
    return ((x - minval) % range + range) % range + minval;
  }
}