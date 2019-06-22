var my_video   = document.getElementById("my_canvas");
var debug_text = document.getElementById("debug_text");

function handling_click_on_video( event )
{
    var relative_click_x = event.pageX - this.offsetLeft;
    var relative_click_y = event.pageY - this.offsetTop;

    debug_text.innerHTML = "Click x: " + relative_click_x + " Click y: " + relative_click_y;

  //  if( my_video.paused )
  //    my_video.play();
  //  else
   //   my_video.pause();

}
  
my_video.addEventListener("click", handling_click_on_video );


