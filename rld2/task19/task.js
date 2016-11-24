var data= [];
var state=[];
var checked;
var sel;
var timer;
//选择执行的动作
function select_btn(name) {
    sel=name;
    var input = document.getElementById('input');
    var input_txt = input.value;
    switch (name) {
        case "left_in":
            if(input_txt){
                data.splice(0, 0,parseInt(input_txt));
            }
            break;
        case "right_in":
            if(input_txt){
                data.splice(data.length, 0,parseInt(input_txt));
            }
            break;
        case "left_out":
            data.splice(0, 1);
            break;
        case "right_out":
            data.splice(data.length-1,1);
            break;
        case "bubbling":
            bubbling(data);
            break;
        default:
            break;
    }
    drawBase();
    input.value = "";
    rendImage();
    if(sel=="bubbling"){
        var sl=state.length;
        checked=sl;
        timer=setInterval(rendImage,500);
    }
}

//监听btn;
function initbtn() {
    var select = document.getElementById('select');
    var select_list = select.getElementsByTagName('input');
    for (var i in select_list) {
        select_list[i].onclick = function() {
            select_btn(this.name);
        };
    }
}
function drawBase(){
    var army = document.getElementById('army');
    army.innerHTML="";
    for (var i in data){
            army.innerHTML += "<span class=\"span\"></span>";
    }
}

function rendImage() {
    var arms = [].slice.call(document.querySelectorAll('.span'));
    var s;
    //判断是普通的增减数据,还是排序
    if(sel=="bubbling"){
        s = state.shift() || [];
        checked--;
    }else{
        s=data;
    }
    //如果排序的话，通过获取state的长度，控制循环次数
    if(checked==0){
        clearInterval(timer);
    }
    for(var arm in arms){
      arms[arm].style.height =1*s[arm];
      arms[arm].style.left = 12*arm;
    }
}

/*冒泡排序*/
function bubbling(data){
    var length=data.length;
    for(var i = 0; i <length; i++){
      for(var j = 0; j < length - i - 1; j++){
        if(data[j] > data[j+1]){
          data[j]   = data[j] + data[j+1];
          data[j+1] = data[j] - data[j+1];
          data[j]   = data[j] - data[j+1];
          state.push(JSON.parse(JSON.stringify(data)));
        }
      }
    }
}

function init() {
    initbtn();
}
init();
