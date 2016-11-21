function test(){
	var a="<h4 style='margin:0 0 5px 0;padding:0.2em 0'>天安门</h4>"+"<img style='float:right;margin:4px' id='imgDemo'src='http://app.baidu.com/map/images/tiananmen.jpg' width='139' height='104' title='天安门'/>" + 
	"<p style='margin:0;line-height:1.5;font-size:13px;text-indent:2em'>天安门坐落在中国北京市中心,故宫的南侧,与天安门广场隔长安街相望,是清朝皇城的大门...</p>";
   /* map = new BMap.Map("allmap");
	map.centerAndZoom(new BMap.Point(25.860823,56.546028), 8);
	map.enableScrollWheelZoom(true); 
	map.addControl(new BMap.MapTypeControl());   //添加地图类型控件
*/	var data_info = [[28.068498,56.829515,a],
					 [19.679331,56.829515,"地址：北京市东城区东华门大街"],
					 [26.008001,58.370066,"地址：北京市东城区正义路甲5号"]
					];
	 map.clearOverlays();
	for(var i=0;i<data_info.length;i++){
		var marker = new BMap.Marker(new BMap.Point(data_info[i][0],data_info[i][1]));  // 创建标注
		marker.setAnimation(BMAP_ANIMATION_BOUNCE); 
		var content = data_info[i][2];
		map.addOverlay(marker);               // 将标注添加到地图中
		marker.setAnimation(BMAP_ANIMATION_BOUNCE); //跳动的动画
		addClickHandler(content,marker);
	}
	map.centerAndZoom(new BMap.Point(data_info[data_info.length-1][0],data_info[data_info.length-1][1]), 8);
	function addClickHandler(content,marker){
		marker.addEventListener("click",function(e){
			openInfo(content,e)}
		);
	}
	function openInfo(content,e){
		var p = e.target;
		var point = new BMap.Point(p.getPosition().lng, p.getPosition().lat);
		var infoWindow = new BMap.InfoWindow(content);  // 创建信息窗口对象 
		map.openInfoWindow(infoWindow,point); //开启信息窗口
		 document.getElementById('imgDemo').onload = function (){
			   infoWindow.redraw();   //防止在网速较慢，图片未加载时，生成的信息框高度比图片的总高度小，导致图片部分被隐藏
		   }
	}
	
}
	test();


