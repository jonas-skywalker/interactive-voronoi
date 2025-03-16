let voronoi;
let wiggling;

function setup() {
  createCanvas(window.innerWidth, window.innerHeight, 800);

  document.body.style.overflow = 'hidden';
  document.addEventListener('touchmove', function (event) {
    event.preventDefault();
  }, { passive: false });
  
  voronoi = new Voronoi([[400, 100], [200, 300]]);
  
  let btn = createButton("Wiggle");
  btn.mousePressed(toggleWiggle);
  btn.position(10, 10);
  
  let add_p = createButton("Add");
  add_p.mousePressed(add_particle);
  add_p.position(80, 10);
  
  wiggling = false;
  
  frameRate(30);
}

function draw() {
  background(220);
  voronoi.update(wiggling);
  voronoi.display();
}

function keyPressed() {
  if (key === 'p') {
    voronoi.add_particle(mouseX, mouseY, wiggling);
  }
}

function doubleClicked() {
  voronoi.add_particle(mouseX, mouseY, wiggling);
}

function add_particle() {
  voronoi.add_particle(random(0, width), random(0, height), wiggling);
}

function toggleWiggle() {
  voronoi.toggleWiggle();
  wiggling = !wiggling;
}
