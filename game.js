var map_1=[
"###############",
"#             #",
"# # ####### # #",
"#   #     #   #",
"# # # # # # # #",
"# # # # # # # #",
"# #         # #",
"# ### ### ### #",
"# #         # #",
"# # # # # # # #",
"# # # # # # # #",
"#   #     #   #",
"# # ####### # #",
"#@            #",
"###############"
];


var actorChars = {
  "@": Player
};

/*==================
  Vector "class" a constructor + added prototypes
====================*/
function Vector (x,y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.plus = function (other) {
  return new Vector (this.x + other.x, this.y + other.y);
};

Vector.prototype.times = function (factor) {
  return new Vector (this.x *factor, this.y * factor);
};

/*==================
  Player "class" : a constructor + added prototypes
====================*/
function Player (pos) {
  this.pos = pos.plus(new Vector(0,-0.5));
  this.size = new Vector (1,1);
  this.speed = new Vector (0,0);
}

Player.prototype.type = "player";


/*==================
  Level "class" a constructor + added prototypes
====================*/
function Level (plan) {
  this.width = plan[0].length;
  this.height = plan.length;
  this.grid = [];
  this.actors = [];
  for (var y =0; y < this.height;y++){
    var line = plan[y], gridLine = [];
    for (var x = 0; x < this.width; x++){
      var ch = line[x];
      var fieldType = null;
      var Actor = actorChars[ch];
      if (Actor)
        this.actors.push(new Actor(new Vector(x,y), ch));
      else if (ch == '#')
        fieldType = "wall";
      else if (ch == " ");
        fieldType = "road";
      gridLine.push(fieldType);
    }
    this.grid.push(gridLine);
  }
  this.player = this.actors.filter(function(actor) {
     return actor.type == "player";
  })[0];
  this.status = this.finishDelay = null;
}

Level.prototype.isFinished = function() {
  return this.status != null && this.finishDelay < 0;
};


var simpleLevel = new Level(map_1);
console.log(simpleLevel.width);
console.log(simpleLevel.height);
