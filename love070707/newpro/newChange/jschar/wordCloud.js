var chart = echarts.init(document.getElementById('Cloud'));
var option = {
    tooltip: {},
    series: [ {
        type: 'wordCloud',
        gridSize: 2,
        sizeRange: [12, 50],
        rotationRange: [0, 0],
        shape: 'pentagon',
        width: 310,
        height: 200,
        textStyle: {
            normal: {
                color: function () {
                    return 'rgb(' + [
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160),
                            Math.round(Math.random() * 160)
                        ].join(',') + ')';
                }
            },
            emphasis: {
                shadowBlur: 8,
                shadowColor: '#333'
            }
        },
        data: [
            {
                name: '地震',
                value: 12000
                /*   textStyle: {
                 normal: {
                 color: 'black'
                 },
                 emphasis: {
                 color: 'red'
                 }
                 }*/
            },
            {
                name: '新华社',
                value: 681
            },
            {
                name: '地质勘探局',
                value: 386
            },
            {
                name: '遇难者',
                value: 1055
            },
            {
                name: '人数',
                value: 2467
            },
            {
                name: '哀悼',
                value: 2244
            },
            {
                name: '余震',
                value: 1898
            },
            {
                name: '罗马',
                value: 3484
            },
            {
                name: '6.4级',
                value: 4112
            },
            {
                name: '震级',
                value: 5965
            },
            {
                name: '震源',
                value: 847
            },
            {
                name: '倒塌',
                value: 582
            },
            {
                name: '遇难',
                value: 555
            },
            {
                name: '受伤',
                value: 550
            },
            {
                name: '失踪',
                value: 462
            },
            {
                name: '死亡',
                value: 366
            },
            {
                name: '城镇',
                value: 360
            },
            {
                name: '佩鲁贾',
                value: 8282
            },
            {
                name: '8月24日',
                value: 9273
            },
            {
                name: '意大利',
                value: 8659
            },
            {
                name: '凌晨',
                value: 9445
            }
        ]
    } ]
};

chart.setOption(option);

/**
 * Created by Administrator on 2016/10/25.
 */
