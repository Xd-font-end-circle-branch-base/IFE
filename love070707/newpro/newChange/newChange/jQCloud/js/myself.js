// <script type="text/javascript">
	var data = [
		['地震', 13, 100],
		['佩鲁贾', 10, 123],
		['受灾', 9, 222],
		[' 意大利', 8, 111],
		['中部', 7, 111],
		['8月', 6, 111],
		['微博', 5, 111],
		['发生', 5, 111],
		['死亡', 5, 111],
		['当地', 5, 111],
		['遇难', 4, 111],
		['造成', 4, 111],
		['24日', 3, 111],
		['人数', 3, 111],
		['25日', 3, 111],
		['时间', 3, 111],
		['8月24日', 3, 111],
		['凌晨', 3, 111],
		['地区', 2, 111],
		['救援', 2, 111],
		['至少', 2, 111],
		['升至', 2, 111],
		['目前', 2, 111],
		['马特里切', 2, 111],
		['中国', 2, 111],
		['废墟', 2, 111],
		['严重', 2, 111],
		['遇难者', 1, 111],
		['民防局', 1, 111],
		['强震', 1, 111],
		['余震', 1, 111],
		['灾区', 1, 111]
	];
	
	var string_ = "";
	for (var i = 0; i < data.length; i++) {
		var string_f = data[i][0];
		var string_n = data[i][1];
		string_ += "{text: '" + string_f + "', weight: '" + string_n + "',html: {'class': 'span_list',onmouseover:'on_mouseover(this,event)',onmouseout:'on_mouseout()'}},";
	}

	function on_mouseover(e, ev) {
		var txt = $(e).html();
		ev = ev || event;
		$.each(data, function(i, item) {
			if(txt == item[0]){
				var html = null;//item[0] +"<br />曝光数"+item[1]+"<br />"+item[2]
				$("#my_favorite_latin_words").after("<div class='append_div' style='left:" + ev.clientX + "px; top:" + ev.clientY + "px; '>" + html + "</div>");
				return;
			}
			
		});
	}
	$(function() {
		$("#my_favorite_latin_words").jQCloud(word_list);
	});
	var string_list = string_;
	var word_list = eval("[" + string_list + "]");

	function on_mouseout() {
		$(".append_div").remove();
	}
// </script>