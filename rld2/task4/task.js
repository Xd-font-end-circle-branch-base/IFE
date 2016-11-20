/**
 * aqiData，存储用户输入的空气指数数据
 * 示例格式：
 * aqiData = {
 *    "北京": 90,
 *    "上海": 40
 * };
 */
var aqiData = {};

/**
 * 从用户输入中获取数据，向aqiData中增加一条数据
 * 然后渲染aqi-list列表，增加新增的数据
 */
function addAqiData() {
    var city=document.getElementById('aqi-city-input');
    var number=document.getElementById('aqi-value-input');
    var name_test=/^[a-zA-Z\u4E00-\u9FA5]+$/;
    var num_test=/^\d+$/g;
    if(!name_test.test(city.value)){
        alert("请输入合法的城市名");
        city.focus();
        return;
    }
    if(!num_test.test(number.value)){
        alert("空气指数应为整数");
        number.focus();
        return;
    }
    aqiData[city.value]=number.value;
    console.log(aqiData);
}

/**
 * 渲染aqi-table表格
 */
function renderAqiList() {
    var table=document.getElementById('aqi-table');
    table.innerHTML="<tr><td>城市</td><td>空气质量</td><td>操作</td></tr>";
    for(var city in aqiData){
        table.innerHTML+="<tr><td>"+city+"</td><td>"+aqiData[city]+"</td><td><button data-city="+city+">删除</button></td></tr>";
    }
    if(city===undefined){
        table.innerHTML="";
    }
}

/**
 * 点击add-btn时的处理逻辑
 * 获取用户输入，更新数据，并进行页面呈现的更新
 */
function addBtnHandle() {
  addAqiData();
  renderAqiList();
}

/**
 * 点击各个删除按钮的时候的处理逻辑
 * 获取哪个城市数据被删，删除数据，更新表格显示
 */
function delBtnHandle(city) {
  // do sth
  delete aqiData[city];
  renderAqiList();
}

function init() {
    var btn=document.getElementById('add-btn');
    btn.addEventListener("click", addBtnHandle);
  // 在这下面给add-btn绑定一个点击事件，点击时触发addBtnHandle函数

  // 想办法给aqi-table中的所有删除按钮绑定事件，触发delBtnHandle函数
  /*由于网页加载完毕时,并不存在子元素，因此无法监听(应该把？讲道理是不能。。),所以
  利用JS事件委托的方法监听父元素,再通过target获取得到触发监听的元素节点,
  如果是button则触发delBtnHandle函数。
  通过对button设置data属性,将要删除的city绑定给button,在触发delBtnHandle时
  将city传入。
  */
    var del=document.getElementById('aqi-table');
    del.addEventListener("click",function(event){
        if(event.target.nodeName.toLowerCase()==='button'){
            delBtnHandle.call(null, event.target.dataset.city);
        }
    });

}

init();
