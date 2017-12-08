var vertexShaderSource = `#version 300 es

in vec4 a_position;
in vec2 a_texcoord;

out vec2 v_texcoord;

void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es
precision mediump float;

in vec2 v_texcoord;

uniform sampler2D u_texture;

out vec4 outColor;

void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

// Initial positions
var positions = [
  0, 0,
  0, 1,
  1, 0,

  1, 0,
  0, 1,
  1, 1
];

// Initial texture coordinates
var texcoords = [
  0, 0,
  0, 1,
  1, 0,

  1, 0,
  0, 1,
  1, 1
];

// Reference to the picture name and image bring rendered
var fName = "";
var image;

function loadShader(gl, shaderSource, shaderType) {
  var shader = gl.createShader(shaderType);

  gl.shaderSource(shader, shaderSource);

  gl.compileShader(shader);

  return shader;
}

function loadProgram(gl) {
  var program = gl.createProgram();

  var shader = loadShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);
  gl.attachShader(program, shader);

  shader = loadShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
  gl.attachShader(program, shader);

  gl.linkProgram(program);

  return program;
}

function loadImage() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  var program = loadProgram(gl);

  function loadTexture(url) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                  new Uint8Array([0, 0, 255, 255]));

    var img = new Image();
    img.addEventListener('load', function() {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
    });
    img.src = url;

    return tex;
  }

  // Only load texture if image is null
  if (!image || fName != document.getElementById('fname').value)
  {
    fName = document.getElementById('fname').value;
    image = loadTexture(fName);
  }

  var positionLocation = gl.getAttribLocation(program, "a_position");
  var texcoordLocation = gl.getAttribLocation(program, "a_texcoord");
  var textureLocation = gl.getUniformLocation(program, "u_texture");

  var vao = gl.createVertexArray();

  gl.bindVertexArray(vao);

  var positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(positionLocation);

  gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

  var texcoordBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texcoords), gl.STATIC_DRAW);

  gl.enableVertexAttribArray(texcoordLocation);

  gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, true, 0, 0);

  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function render(time) {
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
}

// Keyboard numbers
var LEFT = 37;
var UP = 38;
var RIGHT = 39;
var DOWN = 40;

// Key handler used to determine which transform to apply
window.onkeydown = function(e) {
  // Retrieve transform value
  var transform = document.getElementById('transform').value;

  // Retrieve key type
  var key = e.keyCode ? e.keyCode : e.which;

  // Prevent arrow keys from modifying select list
  e.preventDefault();

  // Determine if translate transform
  if (transform == "translate")
  {
    // Translate by direction
    if (key == LEFT)
    {
      trans(-0.01, 0);
    }
    else if (key == RIGHT)
    {
      trans(0.01, 0);
    }
    else if (key == UP)
    {
      trans(0, 0.01);
    }
    else if (key == DOWN)
    {
      trans(0, -0.01);
    }
  }
  // Determine if shear transform
  else if (transform == "shear")
  {
    // Shear by direction
    if (key == LEFT)
    {
      shear(-0.01, 0);
    }
    else if (key == RIGHT)
    {
      shear(0.01, 0);
    }
    else if (key == UP)
    {
      shear(0, 0.01);
    }
    else if (key == DOWN)
    {
      shear(0, -0.01);
    }
  }
  // Determine if rotate transform
  else if (transform == "rotate")
  {
    // Determine if rotate counter clock wise
    if (key == LEFT)
    {
      rotate(-0.01);
    }
    // Determine if rotate clock wise
    else if (key == RIGHT)
    {
      rotate(0.01);
    }
  }
  // Determine if scale transform
  else if (transform == "scale")
  {
    // Determine if scale up
    if (key == UP)
    {
      scale(0.01);
    }
    // Determine if scale down
    else if (key == DOWN)
    {
      scale(-0.01);
    }
  }
}

// Function used to shear image
function shear(shearx, sheary)
{
  // Loop through each value pair
  for (var i = 0, size = positions.length; i < size; i+=2)
  {
      // Get x and y coordinates
      var x = positions[i];
      var y = positions[i+1];

      // Multiply x and y values by sheer factors
      x = x + shearx * y;
      y = sheary * x + y;

      // Set position values
      positions[i] = x;
      positions[i+1] = y;
  }

  loadImage();
}

// Function used to translate image
function trans(transx, transy)
{
  // Use for loop to translate position by a certain amount
  for (var i = 1, size = positions.length; i <= size; i++)
  {
    // If odd, add x value
    if (i % 2 != 0)
    {
      positions[i-1] += parseFloat(transx);
    }
    // If even, add y value
    else
    {
      positions[i-1] += parseFloat(transy);
    }
  }

  // Redraw image
  loadImage();
}

// Function used to rotate image
function rotate(rotval)
{
  // Loop through each value pair
  for (var i = 0, size = positions.length; i < size; i+=2)
  {
      // Get x and y coordinates
      var x = positions[i];
      var y = positions[i+1];

      // Perform x and y calculation based on affine matrix values
      x = x * Math.cos(rotval) - y * (Math.sin(rotval));
      y = x * Math.sin(rotval) + y * Math.cos(rotval);

      // Set position values
      positions[i] = x;
      positions[i+1] = y;
  }

  // Redraw image
  loadImage();
}

// Function used to scale image
function scale(scale)
{
  // Loop through each value pair
  for (var i = 0, size = positions.length; i < size; i+=2)
  {
      // Get x and y coordinates
      var x = positions[i];
      var y = positions[i+1];

      // Multiply x and y valu by scale value
      x += x * scale;
      y += y * scale;

      // Set position values
      positions[i] = x;
      positions[i+1] = y;
  }

  // Redraw the image
  loadImage();
}
