// If the browser does not support any URL, getUserMedia or
// requestAnimationFrame implementation, we just ignore it.
// My policy for experimental software is: if you don't have a
// nightly build, you don't deserve exceptions.
window.URL = window.URL || window.webkitURL

navigator.getUserMedia  = navigator.getUserMedia || 
                          navigator.webkitGetUserMedia ||
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia

window.requestAnimationFrame = window.requestAnimationFrame ||
                               window.webkitRequestAnimationFrame ||
                               window.mozRequestAnimationFrame ||
                               window.msRequestAnimationFrame ||
                               window.oRequestAnimationFrame

// Aaaand, let's get going!
var canvas,context,video,width = 640,height= 480;
window.onload = function(){

    canvas = document.getElementById('canvas');
    ctx =this.canvas.getContext('2d');
    var streamContainer = document.createElement('div')
    video = document.createElement('video')
    video.setAttribute('autoplay', '1')
    video.setAttribute('width', width)
    video.setAttribute('height', height)
    streamContainer.appendChild(video)
    navigator.getUserMedia({video: true}, function(stream) {
      video.src = window.URL.createObjectURL(stream)
      draw()
    })
  //document.body.appendChild(streamContainer)
  }

function draw() {
  asciifyImage(this.canvas,this.ctx,width,height, this.video)
  requestAnimationFrame(draw) 
}

 var bResolution = .25;
  var iScale = 1;
  var bColor = false; // nice but slows down rendering!
  var bAlpha = false;
  var bBlock = false;
  var bInvert = false;
  var strResolution = 'low';

  var aDefaultCharList = (" .,:;i1tfLCG08@").split("");
  var aDefaultColorCharList = (" CGO08@").split("");
  var strFont = "courier new";
  // convert img element to ascii
  function asciifyImage(oCanvas,oCtx,w,h,oImg,oAscii) 
  {
    var fakeWidth = window.innerWidth;
    var fakeHeight = window.innerHeight;

    var aCharList = (bColor ? aDefaultColorCharList : aDefaultCharList);

    var fResolution = 0.5;
    switch (strResolution) {
      case "low" :  fResolution = 0.25; break;
      case "medium" : fResolution = 0.5; break;
      case "high" :   fResolution = 1; break;
    }

    if (bResolution) fResolution = bResolution;

    var iWidth = Math.round(fakeWidth * fResolution);
    var iHeight = Math.round(fakeHeight * fResolution);

    oCanvas.width = iWidth;
    oCanvas.height = iHeight;
    oCanvas.style.width = iWidth;
    oCanvas.style.height = iHeight;

    oCtx.drawImage(oImg, 0, 0, iWidth, iHeight);
    var oImgData = oCtx.getImageData(0, 0, iWidth, iHeight).data;

       
  
    var strChars = "";

    for (var y=0;y<iHeight;y+=2) {
      for (var x=0;x<iWidth;x++) {
        var iOffset = (y*iWidth + x) * 4;
  
        var iRed = oImgData[iOffset];
        var iGreen = oImgData[iOffset + 1];
        var iBlue = oImgData[iOffset + 2];
        var iAlpha = oImgData[iOffset + 3];
        var iCharIdx;

                var fBrightness;
              
        fBrightness = (0.3*iRed + 0.59*iGreen + 0.11*iBlue) / 255;
                
                if (iAlpha == 0) {
                  // should calculate alpha instead, but quick hack :)
                    //fBrightness *= (iAlpha / 255); 
                    fBrightness = 1;
                    
        } 
                             
                iCharIdx = Math.floor((1-fBrightness) * (aCharList.length-1));

                if (bInvert) {
          iCharIdx = aCharList.length - iCharIdx - 1;
        }
              
                // good for debugging
                //fBrightness = Math.floor(fBrightness * 10);
                //strThisChar = fBrightness;
              
                var strThisChar = aCharList[iCharIdx];    
              
        if (strThisChar===undefined || strThisChar == " ") 
          strThisChar = "&nbsp;";
              
        if (bColor) {
          strChars += "<span style='"
            + "color:rgb("+iRed+","+iGreen+","+iBlue+");"
            + (bBlock ? "background-color:rgb("+iRed+","+iGreen+","+iBlue+");" : "")
            + (bAlpha ? "opacity:" + (iAlpha/255) + ";" : "")
            + "'>" + strThisChar + "</span>";
        } else {
          strChars += strThisChar;
        }
      }
      strChars += "<br/>";
    }
  
  
    var fFontSize = (2/fResolution)*iScale;
    var fLineHeight = fFontSize*1.26;

    // adjust letter-spacing for all combinations of scale and resolution to get it to fit the image width.
    var fLetterSpacing = 0;
    if (strResolution == "low") {
      switch (iScale) {
        case 1 : fLetterSpacing = -1; break;
        case 2 : 
        case 3 : fLetterSpacing = -2.1; break;
        case 4 : fLetterSpacing = -3.1; break;
        case 5 : fLetterSpacing = -4.15; break;
      }
    }
    if (strResolution == "medium") {
      switch (iScale) {
        case 1 : fLetterSpacing = 0; break;
        case 2 : fLetterSpacing = -1; break;
        case 3 : fLetterSpacing = -1.04; break;
        case 4 : 
        case 5 : fLetterSpacing = -2.1; break;
      }
    }
    if (strResolution == "high") {
      switch (iScale) {
        case 1 : 
        case 2 : fLetterSpacing = 0; break;
        case 3 : 
        case 4 : 
        case 5 : fLetterSpacing = -1; break;
      }
    }


    oAscii = document.getElementById('div');
    // can't get a span or div to flow like an img element, but a table works?
    
    oAscii.innerHTML = "<tr><td>" + strChars + "</td></tr>";

    if (oImg.style.backgroundColor) {
      oAscii.rows[0].cells[0].style.backgroundColor = oImg.style.backgroundColor;
      oAscii.rows[0].cells[0].style.color = oImg.style.color;
    }

    oAscii.cellSpacing = 0;
    oAscii.cellPadding = 0;
    var oStyle = oAscii.style;
    oStyle.position = "absolute";
    oStyle.display = "inline";
    oStyle.width = Math.round(w/fResolution*iScale) + "px";
    oStyle.height = Math.round(h/fResolution*iScale) + "px";
    oStyle.whiteSpace = "pre";
    oStyle.margin = "0px";
    oStyle.padding = "0px";
    oStyle.letterSpacing = fLetterSpacing + "px";
    oStyle.fontFamily = strFont;
    oStyle.fontSize = fFontSize + "px";
    oStyle.lineHeight = fLineHeight + "px";
    oStyle.textAlign = "left";
    oStyle.textDecoration = "none";

    // replaces old image with ascii table
   // oImg.parentNode.replaceChild(oAscii, oImg);

    return oAscii
    
  }
