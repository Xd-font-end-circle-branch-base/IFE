var data=[];
//选择执行的动作
function select_btn(name){
    var input=document.getElementById('input');
    var input_txt=input.value;
    switch (name) {
        case "left_in":
            data.splice(0,0,input_txt);
            break;
        case "right_in":
            data.splice(data.length,0,input_txt);
            break;
        case "left_out":
            data.splice(0,1);
            break;
        case "right_out":
            data.splice(data.legth,1);
            break;
        default:
            break;
    }
    input.value="";
    rendImage();
    console.log(data);
}

//监听btn;
function initbtn(){
    var select=document.getElementById('select');
    var select_list=select.getElementsByTagName('input');
    for(var i in select_list){
        select_list[i].onclick=function(){
                select_btn(this.name);
                console.log(typeof this.name);
        };
    }
}

function rendImage(){
    var army=document.getElementById('army');
    army.innerHTML="";
    for(var i in data){
        army.innerHTML+="<span class=\"span\">"+data[i]+"</span>";
    }
}

function init(){
    initbtn();
}

init();
