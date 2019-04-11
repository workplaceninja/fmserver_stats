var url = '';
// You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/
// and then set the url accordingly.

//url = 'http://fmserver_path/serverstats/stats.php';




if ( url === '' ) {
	window.alert('You must set the url in the serverstats.js file.');
} else {
	var default_snapshots = 240;
	var chartData = [];
	var chart, graphs;
	getStats(1);
	var refint = setInterval(function() {refreshChart();}, 30000);
}


function ref () {
	var val = +document.getElementById('ref').value;
	clearInterval(refint);
	refint = setInterval(function() {refreshChart();}, val * 1000);
}


function refreshChart () {
	getStats(0);
}


function getStats (fullrefresh) {
	var xmlhttp = new XMLHttpRequest();
	
	xmlhttp.onreadystatechange=function() {
		if (xmlhttp.readyState==4) {
			if (xmlhttp.status==200) {
				// Success
				var csv = xmlhttp.responseText;
				chartData = amReformat(csv);
				errlog('');
				if ( fullrefresh === 1 ) {
					createChart();
				} else {
					updateChart();
				}
			} else {
				errlog('Error loading data from FM Server - ' + xmlhttp.status + '.  You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/"');
			}
		}
	};
	
	var thisurl = url + '?type=server&rnd=' + Math.random();
	
	xmlhttp.open("GET", thisurl, true);
	xmlhttp.timeout = 30000;
	xmlhttp.ontimeout = function() { errlog('Timeout retrieving data from FM Server'); };
	xmlhttp.send();
}


function errlog (str) {
	var el = document.getElementById('errlog');
	el.innerText = str;
	var cn = (str === '' ? 'noerror' : 'error');
	if ( el.className !== cn ) {
		el.className = cn;
	}
}


function amReformat (csv) {
	var cArr = [];
	var csvlines = csv.split("\n");
	var obj;
	
	var headerArr = [	
						'Timestamp', 'Network KB/sec In', 'Network KB/sec Out', 'Disk KB/sec Read', 'Disk KB/sec Written', 'Cache Hit %', 
						'Cache Unsaved %', 'Pro Clients', 'Open Databases', 'ODBC/JDBC Clients', 'WebDirect Clients', 'Custom Web Clients', 
						'Remote Calls/sec', 'Remote Calls In Progress', 'Elapsed Time/call', 'Wait Time/call', 'I/O Time/call', 'Go Clients'
					];
					
	var valueArr = [		
						'date', 'netin', 'netout', 'diskread', 'diskwrite', 'cachehit', 
						'cacheunsaved', 'proclients', 'opendbs', 'xdbcclients', 'webdclients', 'cwpclients', 
						'callspersec', 'callsinprog', 'elapsed', 'wait', 'io', 'goclients'
					];
					
	var colorArr = [
						'#901b52', '#1c72f5', '#eb47f9', '#1f189f', '#0977bf', '#8e713c', 
						'#0f2b1f', '#8abdcc', '#a301d5', '#a099da', '#4b8051', '#a8a4a5', 
						'#f83169', '#4b996f', '#34df9d', '#6b039a', '#da7e52', '#ee9915'
					];
					
	var pointArr = [
						0, 1, 1, 1, 1, 2, 
						2, 3, 3, 3, 3, 3, 
						4, 4, 5, 5, 5, 3
					];
					
	var hiddenArr = [
						true, true, true, true, true, true, 
						true, true, true, true, true, true, 
						false, false, false, false, true, true
					];
					
	
	var y, ycount = headerArr.length;
	var x = 1, xcount = csvlines.length;
	while (x < xcount) {
		csvcolumns = csvlines[x].split("\t");
		obj = {};
		obj[valueArr[0]] = new Date(csvcolumns[0]);
		y = 1;
		while ( y < ycount ) {
			obj[valueArr[y]] = +csvcolumns[y];
			y += 1;
		}
		
		cArr.push(obj);
		x += 1;
	}
	
	graphs = [];
	var y = 1;
	while ( y < ycount ) {
		graphs.push(
			{
				"id": "c" + y,
				"balloonText": "[[title]]: [[value]]",
				"bullet": "round",
				"bulletBorderAlpha": 1,
				"bulletColor": colorArr[y],
				"bulletSize": 5,
				"color": colorArr[y],
				"lineColor": colorArr[y],
				"valueAxis": 'g' + pointArr[y],
				"hidden": hiddenArr[y],
				"title": headerArr[y],
				"valueField": valueArr[y],
				"useLineColorForBulletBorder": true
			}
		);
		y += 1;
	}
	return cArr;
}


function updateChart () {
	var st = chart.startIndex;
	var et = chart.endIndex;
	var len = chartData.length;
	
	chart.dataProvider = chartData;
	chart.validateData();
	
	if ( et === len - 1 ) {
		//reset zoom to new end
		chart.zoomToIndexes(st, chartData.length - 1);
	}
}


function createChart () {
	
	chart = AmCharts.makeChart("chartdiv", {
	    "type": "serial",
	    "theme": "none",
	    "marginRight": 80,
		"autoMarginOffset": 20,
		"marginTop": 7,
		"zoomOutOnDataUpdate": false,
		"legend": {
			"horizontalGap": 10,
			"position": "bottom",
			"useGraphSettings": true,
			"markerSize": 10
		},
		"dataProvider": chartData,
		"valueAxes": [
			{
				"id": "g1",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 130,
				"gridThickness": 0
			}, {
				"id": "g2",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "right",
				"offset": 70,
				"gridThickness": 0
			}, {
				"id": "g3",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 70,
				"gridThickness": 0
			}, {
				"id": "g4",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "right",
				"offset": 0,
				"gridThickness": 0
			}, {
				"id": "g5",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left",
				"offset": 0,
				"gridThickness": 0
			}
		],
		"mouseWheelZoomEnabled": true,
		"graphs": graphs,
		"chartScrollbar": {
			"autoGridCount": true,
			"graph": "c14",
			"scrollbarHeight": 40
		},
		"chartCursor": {
		   "limitToGraph": "c14",
		   "categoryBalloonDateFormat": "MMM D, YYYY JJ:NN:SS"
		},
		"categoryField": "date",
		"categoryAxis": {
			"parseDates": true,
			"minPeriod": "5ss",
			"axisColor": "#DADADA",
			"dashLength": 1,
			"minorGridEnabled": true
		},
		"export": {
			"enabled": true
		}
	});
	
	chart.addListener("rendered", zoomChart);
	zoomChart();
}


function zoomChart() {
    chart.zoomToIndexes(chartData.length - default_snapshots, chartData.length - 1);
}

