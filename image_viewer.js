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

function main() {
  var canvas = document.getElementById("canvas");
  var gl = canvas.getContext("webgl2");

  if (!gl) {
    return;
  }

  var program = loadProgram(gl);

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

  gl.vertexAttribPointer(
      texcoordLocation, 2, gl.FLOAT, true, 0, 0);

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

  var image = loadTexture('stone1.png');

  function draw() {
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gl.useProgram(program);

    gl.bindVertexArray(vao);

    gl.uniform1i(textureLocation, 0);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, image);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  function render(time) {
    draw();
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);

}

main();

// Function used to shear image
function shear()
{
  // Get sheer values
  var sheerx = parseFloat(document.getElementById('shearx').value);
  var sheery = parseFloat(document.getElementById('sheary').value);

  // Loop through each value pair
  for (var i = 0, size = positions.length; i < size; i+=2)
  {
      // Get x and y coordinates
      var x = positions[i];
      var y = positions[i+1];

      // Multiply x and y values by sheer factors
      x = x + sheerx * y;
      y = sheery * x + y;

      // Set position values
      positions[i] = x;
      positions[i+1] = y;
  }

  main();
}

// Function used to translate image
function trans()
{
  // Start by finding amounts to translate by
  var transx = document.getElementById('transx').value;
  var transy = document.getElementById('transy').value;

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
  main();
}

// Function used to rotate image
function rotate()
{
  // Get rotation value
  var rotval = parseFloat(document.getElementById('rotval').value);

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
  main();
}

// Function used to scale image
function scale()
{
  // Get scale value
  var scale = parseFloat(document.getElementById('scaleval').value);

  // Loop through each value pair
  for (var i = 0, size = positions.length; i < size; i+=2)
  {
      // Get x and y coordinates
      var x = positions[i];
      var y = positions[i+1];

      // Multiply x and y valu by scale value
      x = x * scale;
      y =y * scale;

      // Set position values
      positions[i] = x;
      positions[i+1] = y;
  }

  // Redraw the image
  main();
}
