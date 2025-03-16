class Voronoi {
  constructor(positions) {
    this.particles = [];
    for (let i = 0; i < positions.length; i++) {
      this.particles.push(new Particle(positions[i][0], positions[i][1]));
    }
    this.sup1 = createVector(-4*width, -height);
    this.sup2 = createVector(2*width, -height);
    this.sup3 = createVector(2*width, 5*height);
    this.triangles = [];
    this.points = [];
  }
  
  toggleWiggle() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].wiggle = !this.particles[i].wiggle;
    }
  }
  
  update() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].update();
    }
    
    // do delauny triangulation
    // add ghost points for periodic boundary conditions
    var periodic_points = [];
    for (let i = -1; i < 2; i++) {
      for (let j = -1; j < 2; j++) {
        for (let k = 0; k < this.particles.length; k++) {
          periodic_points.push(createVector(this.particles[k].pos.x + i * width, 
                                this.particles[k].pos.y + j * height));
        }
      }
    }
    this.points = periodic_points;
//     let periodic_points = []
//     for (let k = 0; k < this.particles.length; k++) {
//       periodic_points.push(this.particles[k].pos);
//     }
    let triangulation = [];
    // add super triangle
    triangulation.push(new Triangle(this.sup1, this.sup2, this.sup3));
    for (let i = 0; i < periodic_points.length; i++) {
      let new_triangulation = [];
      let bad_triangles = [];
      for (let j = 0; j < triangulation.length; j++) {
        if (triangulation[j].in_circumcircle(periodic_points[i])) {
          bad_triangles.push(triangulation[j]);
        } else {
          new_triangulation.push(triangulation[j]);
        }
      }
      let edges = [];
      for (let j = 0; j < bad_triangles.length; j++) {
        edges.push([bad_triangles[j].vertices[0],
                    bad_triangles[j].vertices[1]]);
        
        edges.push([bad_triangles[j].vertices[1],
                    bad_triangles[j].vertices[2]]);

        edges.push([bad_triangles[j].vertices[2],
                    bad_triangles[j].vertices[0]]);
      }
      // find unique edges and retriangulate the resulting polygon with these edges
      for (let j = 0; j < edges.length; j++) {
        let count = 0;
        for (let k = 0; k < edges.length; k++) {
          if (Triangle.same_edge(edges[k], edges[j])) {
            count++;
          }
        }
        if (count == 1) {
          // unique edge
          new_triangulation.push(new Triangle(edges[j][0], 
                                              edges[j][1],
                                              periodic_points[i]));
        }
      }
      triangulation = new_triangulation;
    }
    let final_triangulation = [];
    for (let i = 0; i < triangulation.length; i++) {
      if (!(triangulation[i].has_vertex(this.sup1) ||
          triangulation[i].has_vertex(this.sup2) ||
          triangulation[i].has_vertex(this.sup3))) {
        final_triangulation.push(triangulation[i]);
      }
    }
    this.triangles = final_triangulation;
  }
  
  display() {
    for (let i = 0; i < this.particles.length; i++) {
      this.particles[i].display();
    }
    
    for (let i = 0; i < this.triangles.length; i++) {
      this.triangles[i].display();
    }
    
    // draw the voronoi diagram
    for (let i = 0; i < this.points.length; i++) {
      let tris = []
      for (let j = 0; j < this.triangles.length; j++) {
        if (this.triangles[j].has_vertex(this.points[i])) {
          tris.push(this.triangles[j]);
        }
      }
      for (let l = 0; l < tris.length; l++) {
        for (let k = 0; k < tris.length; k++) {
          if (k != l) {
            if (tris[l].shares_edge(tris[k])) {
              push();
              stroke(255, 0, 0);
              strokeWeight(2);
              line(tris[l].circumcenter.x, tris[l].circumcenter.y, 
                   tris[k].circumcenter.x, tris[k].circumcenter.y)
              pop();
            }
          }
        }
      }
    }
  }
  
  add_particle(x, y, wiggling) {
    this.particles.push(new Particle(x, y, wiggling));
  }
}

class Triangle {
  constructor(pos1, pos2, pos3) {
    // sort the indices anticlockwise 
    let a = p5.Vector.sub(pos1, pos2);
    let b = p5.Vector.sub(pos2, pos3);
    let det_ab = a.x * b.y - b.x * a.y;
    if (det_ab < 0) {
      this.vertices = [pos1, pos3, pos2];
    } else if (det_ab > 0) {
      this.vertices = [pos1, pos2, pos3];
    } else {
      this.vertices = [pos1, pos2, pos3];
    }
  }
  
  in_circumcircle(pos) {
    // calculate vectors for test determinant
    let v1 = createVector(this.vertices[0].x - pos.x, 
                          this.vertices[1].x - pos.x, 
                          this.vertices[2].x - pos.x);
    let v2 = createVector(this.vertices[0].y - pos.y, 
                          this.vertices[1].y - pos.y, 
                          this.vertices[2].y - pos.y);
    let v3 = createVector(v1.x**2 + v2.x**2, v1.y**2 + v2.y**2, v1.z**2 + v2.z**2)
    // calulate volume of parallelipiped as determinant
    let determinant = (v1.cross(v2)).dot(v3);
    return determinant > 0;
  }
  
  get circumcenter() {
    let D = 2*(this.vertices[0].x * (this.vertices[1].y - this.vertices[2].y) +
               this.vertices[1].x * (this.vertices[2].y - this.vertices[0].y) + 
               this.vertices[2].x * (this.vertices[0].y - this.vertices[1].y));
    let u_x = 1/D * (this.vertices[0].magSq() * (this.vertices[1].y - this.vertices[2].y) + 
                     this.vertices[1].magSq() * (this.vertices[2].y - this.vertices[0].y) + 
                     this.vertices[2].magSq() * (this.vertices[0].y - this.vertices[1].y));
    let u_y = 1/D * (this.vertices[0].magSq() * (this.vertices[2].x - this.vertices[1].x) + 
                     this.vertices[1].magSq() * (this.vertices[0].x - this.vertices[2].x) + 
                     this.vertices[2].magSq() * (this.vertices[1].x - this.vertices[0].x));
    return createVector(u_x, u_y);
  }
  
  has_vertex(pos) {
    return this.vertices[0].equals(pos) || 
           this.vertices[1].equals(pos) || 
           this.vertices[2].equals(pos)
  }
  
  static same_edge(edge1, edge2) {
    return ((edge1[0].equals(edge2[0])) && (edge1[1].equals(edge2[1]))) || 
           ((edge1[0].equals(edge2[1])) && (edge1[1].equals(edge2[0])))
  }
  
  shares_edge(tri) {
    let count = 0;
    for (let i = 0; i < tri.vertices.length; i++) {
      count += int(this.has_vertex(tri.vertices[i]));
    }
    if (count > 1) {
      return true;
    } else {
      return false
    }
  }
  
  display() {
    push();
    stroke(0, 0, 255, 20);
    strokeWeight(1);
    noFill();
    beginShape();
    vertex(this.vertices[0].x, this.vertices[0].y);
    vertex(this.vertices[1].x, this.vertices[1].y);
    vertex(this.vertices[2].x, this.vertices[2].y);
    endShape(CLOSE);
    pop();
  }
}