  $(document).ready(function() {
    

     if ($(window).height()>($("#fonter").outerHeight(true)+$("#naver").outerHeight(true))) {
      
        var divcss = {
          position:'fixed',
          margin:'auto',
          left:'0',
          right:'0',
          bottom:'0'
          
        };
        $("#naver").css(divcss);
        } 

     else{
      var divcss = {
          position:'relative'
         
        };
        $("#naver").css(divcss);
        } 

      //$("#naver").css("textAlign","center");
      //width: 100px; margin: 0 auto;
      
     
     })
