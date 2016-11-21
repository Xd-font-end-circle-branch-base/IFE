require.config({
    paths: {
        echarts: "buildchar/source/"

    }
});
// 使用
require(
    [
        'echarts',
        'echarts/chart/bar' ,// 使用柱状图就加载bar模块，按需加载
        'echarts/chart/force' ,//使用点击按钮
    ],

    function (ec) {
        // 基于准备好的dom，初始化echarts图表
        var myChart = ec.init(document.getElementById('bar'));

        var ecConfig = require('echarts/config');
        myChart.on(ecConfig.EVENT.CLICK, zConsole);//调用点击函数

        clickable : true;

        var idx = 1;

        var option = {
            /*  timeline:{
             playInterval : 1000
             },*/
            // title : {
            //     text: '各时段新闻数',
            //     subtext: '纯属虚构'
            // },
            
           


            tooltip : {
                        borderColor:'#FFC125'
                    },
                    legend: {
                        data:['新闻数'],
                        x : '310px',
                        y : '45px'

                    },
                    grid:{
                        borderColor:'#FFF5EE'
                    },
                    xAxis : [
                        {
                            axisLine:{
                                show:true
                            },

                            splitLine:{ show:false },
                            type : 'category',
                            data : ['10：00','11：00','12：00','13：00','14：00','15：00','16：00','17：00','18：00','19：00']
                        },
                    ],
                    yAxis : [

                        {
                            axisLine:{
                                show:true
                            },
                            splitLine:{ show:false },
                            type : 'value'
                        }
                    ],
            series : [
                {
                    name:'新闻数',
                    type:'bar',
                    //data:[255, 0,0,0,0,0,0,0,0,0]
                    data:[255,506,456,321,105,232,135,90,98,678]
                },
            ]
        };

        myChart.setOption(option);

    }

);
function zConsole(param) {
    if (typeof param.seriesIndex == 'undefined') {
        return;
    }
    if (param.type == 'click') {
        // alert(param.target);
        switch (param.name) {
            case  "10：00":
                window.location.href = "photo/index.html";
                break;
            case  "11：00":
                window.location.href = "photo/index.html";
                break;
            case  "12：00":
                window.location.href = "photo/index.html";
                break;
            case  "13：00":
                window.location.href = "photo/index.html";
                break;
            case  "14：00":
                window.location.href = "photo/index.html";
                break;
            case  "15：00":
                window.location.href = "photo/index.html";
                break;
            case  "16：00":
                window.location.href = "photo/index.html";
                break;
            case  "17：00":
                window.location.href = "photo/index.html";
                break;
            case  "18：00":
                window.location.href = "photo/index.html";
                break;
            case  "19：00":
                window.location.href = "photo/index.html";
                break;
        }
        //window.location.href="http://echarts.baidu.com/echarts2/doc/example.html"
        // window.location.href = "http://localhost:63342/HTML&CSS/Test/first.html";
    }
}
/**
 * Created by Administrator on 2016/10/25.
 */
