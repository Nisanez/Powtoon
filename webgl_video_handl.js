"use strict";


function create_shader( gl, type, source )
{
    var shader = gl.createShader( type );
    gl.shaderSource( shader, source );
    gl.compileShader( shader );
    var success = gl.getShaderParameter( shader, gl.COMPILE_STATUS );
    if( !success )
    {
        var message= gl.getShaderInfoLog(shader)
         console.log( "problem with creating shader type: " + type + " " + message );  
    }
    else
      return shader;
}

function create_shader_program( gl, vertex_shader, fragment_shader )
{
    var program = gl.createProgram();
    gl.attachShader( program, vertex_shader );
    gl.attachShader( program, fragment_shader );
    gl.linkProgram( program );

    var success = gl.getProgramParameter(program, gl.LINK_STATUS );
    if( !success )
    {
      var message= gl.getProgramInfoLog(program);
      console.log( "problem with creating shader type: " + type + " " + message ); 
    }
    else
    {
        return program;
    }
}

var move = 0;

function setRectangle(gl, x, y, width, height, clickX, clickY )
 {
    var x0 = x;
    var x1 = x + width;
    var y0 = y;
    var y1 = y + height;
    var mid_x = x1 * clickX;
    var mid_y = y1 * clickY;

    move ++;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x0, y1,
      x0 , y0,
      mid_x - move, mid_y, // Triangle 1
      x0, y0,
      x1, y0,
      mid_x, mid_y - move, // Triangle 2
      x1, y0,
      x1, y1,
      mid_x + move, mid_y, // Triangle 3
      x1, y1,
      x0, y1,
      mid_x, mid_y + move, // Triangle 4
    ]), gl.STATIC_DRAW);
}

var gl = null;

function initTexture(gl, url) {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Because video havs to be download over the internet
  // they might take a moment until it's ready so
  // put a single pixel in the texture so we can
  // use it immediately.
  const level = 0;
  const internalFormat = gl.RGBA;
  const width = 1;
  const height = 1;
  const border = 0;
  const srcFormat = gl.RGBA;
  const srcType = gl.UNSIGNED_BYTE;
  const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
  gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                width, height, border, srcFormat, srcType,
                pixel);

  // Turn off mips and set  wrapping to clamp to edge so it
  // will work regardless of the dimensions of the video.
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
}
function render( image )
{


  initTexture( gl );

  var then = 0;

    // Draw the scene repeatedly
  function render2(now) 
  {
    now *= 0.001;  // convert to seconds
    const deltaTime = now - then;
    then = now;

    if( copyVideo )
    {
  canvas.width = image.videoWidth;
  canvas.height = image.videoHeight;

  var vertex_shader_source   = document.getElementById( "vertex_shader").text;
  var fragment_shader_source = document.getElementById( "fragment_shader" ).text;

  var vertex_shader  = create_shader( gl, gl.VERTEX_SHADER,    vertex_shader_source );
  var fragment_shader = create_shader( gl, gl.FRAGMENT_SHADER, fragment_shader_source );

  var program = create_shader_program( gl, vertex_shader, fragment_shader );

  var position_attr_location = gl.getAttribLocation( program, "a_position" );
  var texture_attr_location  = gl.getAttribLocation( program, "a_tex_coord" );

  
  var position_buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, position_buffer );
  console.log( image );
  console.log( image.videoWidth + " " + image.videoHeight );

  setRectangle(gl, 0, 0, image.videoWidth, image.videoHeight, 0.5, 0.5 );

  var tex_coord_buffer = gl.createBuffer();
  gl.bindBuffer( gl.ARRAY_BUFFER, tex_coord_buffer );

  setRectangle( gl, 0,0, image.videoWidth, image.videoHeight, 0.5, 0.5 );

  var texture = gl.createTexture();

  gl.bindTexture( gl.TEXTURE_2D, texture );
    
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

  var resolution_location = gl.getUniformLocation(program, "u_resolution" );

     gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image );

gl.viewport( 0, 0, canvas.width, canvas.height );

  gl.clearColor( 0, 0, 0, 0 );

  gl.clear( gl.COLOR_BUFFER_BIT );

  gl.useProgram(program);

  gl.enableVertexAttribArray( position_attr_location );

  gl.bindBuffer( gl.ARRAY_BUFFER, position_buffer );

  gl.vertexAttribPointer( position_attr_location, 2, gl.FLOAT, false, 0, 0 );

  gl.enableVertexAttribArray( texture_attr_location );

  gl.bindBuffer( gl.ARRAY_BUFFER, tex_coord_buffer );

  gl.vertexAttribPointer( texture_attr_location, 2, gl.FLOAT, false, 0, 0 );

  gl.uniform2f( resolution_location, gl.canvas.width, gl.canvas.height );

  var number_of_verts = 12; // we are now creating 4 triangles.
  gl.drawArrays(gl.TRIANGLES, 0, number_of_verts );
}

    requestAnimationFrame(render2);
  }
  requestAnimationFrame(render2);
  
  
  //gl.bufferData(gl.ARRAY_BUFFER, new Float32Array( position ), gl.STATIC_DRAW );

  
}


var copyVideo = false;

function setupVideo(url) {
  const video = document.createElement('video');

  var playing = false;
  var timeupdate = false;

  video.autoplay = true;
  video.muted = true;
  video.loop = true;

  // Waiting for these 2 events ensures
  // there is data in the video

  video.addEventListener('playing', function() {
     playing = true;
     
     checkReady();
  }, true);

  video.addEventListener('timeupdate', function() {
     timeupdate = true;
     checkReady();
  }, true);

  video.crossOrigin = "";
  video.src = url;
  video.play();

  function checkReady() {
    if (playing && timeupdate) {
      copyVideo = true;

    }
  }

  return video;
}
  var canvas = document.getElementById( "my_canvas" );

function main()
{
      gl = canvas.getContext( "webgl" );
  if( gl == null )
  {
      window.alert( "cant find opengl context!!" );
      return;
  }
  const my_video = setupVideo("vidFree.mp4");

render( my_video );

}



main();