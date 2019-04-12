/* CONFIGURATION */

var snapshots = 2880;

var url = '';
// You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/
// and then set the url accordingly.

//url = 'http://fmserver_path/serverstats/stats.php';

/* END CONFIGURATION */



var chartArr = ['server', 'client'];
var chosencolumn = 5;
var topx = 20;
var refinput = 30;


// The names of the columns in the chart
var headerArr = [
					[	
						'Timestamp', 'Network KB/sec In', 'Network KB/sec Out', 'Disk KB/sec Read', 'Disk KB/sec Written', 'Cache Hit %', 
						'Cache Unsaved %', 'Pro Clients', 'Open Databases', 'ODBC/JDBC Clients', 'WebDirect Clients', 'Custom Web Clients', 
						'Remote Calls/sec', 'Remote Calls In Progress', 'Elapsed Time/call', 'Wait Time/call', 'I/O Time/call', 'Go Clients'
					],
					[	
						'Timestamp', 'Network Bytes In', 'Network Bytes Out', 
						'Remote Calls', 'Remote Calls In Progress', 'Elapsed Time', 
						'Wait Time', 'I/O Time', 'Client name'
					]
				];

// Not important - just internal variable names
var valueArr = [
					[		
						'date', 'netin', 'netout', 'diskread', 'diskwrite', 'cachehit', 
						'cacheunsaved', 'proclients', 'opendbs', 'xdbcclients', 'webdclients', 'cwpclients', 
						'callspersec', 'callsinprog', 'elapsed', 'wait', 'io', 'goclients'
					],
					[		
						'date', 'netin', 'netout',
						'calls', 'callsinprog', 'elapsed', 
						'wait', 'io', 'name'
					]
				];

// Define the color of the lines on the chart
var colorArr = [
					[
						'#901b52', '#1c72f5', '#eb47f9', '#1f189f', '#0977bf', '#8e713c', 
						'#0f2b1f', '#8abdcc', '#a301d5', '#a099da', '#4b8051', '#a8a4a5', 
						'#f83169', '#4b996f', '#34df9d', '#6b039a', '#da7e52', '#ee9915'
					],
					[
						'#901b52', '#1c72f5', '#eb47f9', 
						'#0f2b1f', '#8abdcc', '#a301d5', 
						'#f83169', '#4b996f', '#34df9d'
					]
					
				];

// This defines which Y axis to use.  (Charts that display in microseconds will not work well with others.)
var pointArr = [
					[
						0, 1, 1, 1, 1, 2, 
						2, 3, 3, 3, 3, 3, 
						4, 4, 5, 5, 5, 3
					],
					[
						0, 1, 1,
						4, 4, 5,
						5, 5, 1
					]

				];

// Set which stats are hidden by default
var hiddenArr = [
					[
						true, true, true, true, true, true, 
						true, true, true, true, true, true, 
						false, false, false, false, true, true
					],
					[
						false, false, false,
						false, false, false,
						false, false, false
					]
				];




function getParam(name) {
	name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
	var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
		results = regex.exec(location.search);
	return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}


// 0 = server stats, 1 = client stats
var chartnum = getParam('chartnum');
if ( chartnum === '' ) {
	chartnum = 0;
} else {
	chartnum = +chartnum;
	setTimeout(function() { document.getElementById('chartnum').value = chartnum; showPlotPoints (chartnum) }, 50);
}


if ( url === '' ) {
	window.alert('You must set the url in the serverstats.js file.');
} else {
	var default_snapshots = 240;
	var chartData = [];
	var csv, chart, graphs, valueaxes, nameobj, sortable;
	getStats(1);
	var refint = setInterval(function() {refreshChart();}, refinput * 1000);
}


function reftoggle () {
	var val = +document.getElementById('ref').value;
	if ( val !== refinput ) {
		refinput = val;
		clearInterval(refint);
		refint = setInterval(function() {refreshChart();}, refinput * 1000);
	}
}


function chartnumtoggle () {
	var val = +document.getElementById('chartnum').value;
	if ( chartnum !== val ) {
		chartnum = val;
		getStats(1);
		showPlotPoints(val);
	}
}


function showPlotPoints (val) {
	if ( val === 1 ) {
		buildPlotPoints();
	}
	document.getElementById('plotpoint').className = (val === 0 ? 'chooser hide' : 'chooser show');
}


function buildPlotPoints () {
	var str = '';
	var x = 1, xcount = headerArr[chartnum].length - 1;
	while ( x < xcount ) {
		str += '<option value="' + x + '"' + (chosencolumn === x ? ' selected="selected"' : '') + '>' + headerArr[chartnum][x] + '</option>';
		x += 1;
	}
	document.getElementById('plotpoints').innerHTML = str;
}


function plottoggle () {
	var val = +document.getElementById('plotpoints').value;
	if ( chosencolumn !== val ) {
		chosencolumn = val;
		chartData = amReformat(csv);
		createChart();
	}
}


function topxtoggle () {
	var val = +document.getElementById('topx').value;
	if ( topx !== val ) {
		topx = val;
		chartData = amReformat(csv);
		createChart();
	}
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
				csv = xmlhttp.responseText;
				if ( csv.substring(0,5) === 'Error' ) {
					if ( csv === 'Error - bad path' ) {
						errlog('Error loading data from FM Server - You must enable ' + chartArr[chartnum] + ' stats on FileMaker Server.');
					} else {
						errlog('Error loading data from FM Server - You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/"');
					}
				} else {
					chartData = amReformat(csv);
					errlog('');
					if ( fullrefresh === 1 ) {
						createChart();
					} else {
						updateChart();
					}
				}
			} else {
				errlog('Error loading data from FM Server - ' + xmlhttp.status + '.  You must copy php/serverstats/stats.php over to the FileMaker Server at "FileMaker Server/HTTPServer/conf/"');
			}
		}
	};
	
	var thisurl = url + '?type=' + chartArr[chartnum] + '&lines=' + snapshots * (chartnum === 1 ? 10 : 1) + '&rnd=' + Math.random();
	
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
	var obj = {};
	nameobj = {};
	
	var todaym10 = new Date();
	todaym10.setDate(todaym10.getDate()-10);
	todaym10 = todaym10.getTime();
	
	
	var n, val, y, ycount = headerArr[chartnum].length;
	var x = 1, xcount = csvlines.length;
	var d, lastd = new Date('1/1/1900');
	
	while (x < xcount) {
		csvcolumns = csvlines[x].split("\t");
		d = new Date(csvcolumns[0]);
		
		obj[valueArr[chartnum][0]] = d;
		
		if ( chartnum === 0 ) {
			y = 1;
			while ( y < ycount ) {
				obj[valueArr[chartnum][y]] = +csvcolumns[y];
				y += 1;
			}
		} else {
			n = btoa(csvcolumns[ycount - 1]);
			val = +csvcolumns[chosencolumn];
			
			if ( val >= 0 ) {
				nameobj[n] = (nameobj[n] || 0) + val;
				obj[n] = val;
			}
		}
		
		if ( chartnum === 0 || (d.getTime() !== lastd.getTime() && d.getTime() > todaym10 ) ) {
			cArr.push(obj);
			obj = {};
		}
		
		lastd = new Date(d);
		x += 1;
	}
	
	if ( chartnum === 1 && valueArr[chartnum][0] !== undefined ) {
		cArr.push(obj);
	}
	
	
	graphs = [];
	valueaxes = [];
	
	if ( chartnum === 0 ) {
		var y = 1;
		while ( y < ycount ) {
			graphs.push(
				{
					"id": "c" + y,
					"balloonText": "[[title]]: [[value]]",
					"bullet": "round",
					"bulletBorderAlpha": 1,
					"bulletColor": colorArr[chartnum][y],
					"bulletSize": 5,
					"color": colorArr[chartnum][y],
					"lineColor": colorArr[chartnum][y],
					"valueAxis": 'g' + pointArr[chartnum][y],
					"hidden": hiddenArr[chartnum][y],
					"title": headerArr[chartnum][y],
					"valueField": valueArr[chartnum][y],
					"useLineColorForBulletBorder": true
				}
			);
			y += 1;
		}
		
		valueaxes = [
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
		];
	} else {
	

		sortable = [];
		for (var nameval in nameobj) {
		    sortable.push([nameval, nameobj[nameval]]);
		}
		
		sortable.sort(function(a, b) {
		    return b[1] - a[1];
		});


		x = 0;
		while ( x < topx ) {
			property = sortable[x][0];
			graphs.push(
				{
					"id": property,
					"balloonText": "[[title]]: [[value]]",
					"title": abformat(property),
					"valueField": property,
					"lineAlpha": 0.4,
					"fillAlphas": 0.6,
					"valueAxis": 'g1',
					"forceGap": true,
					"gapPeriod": refinput * 1.02
				}
			);
			x += 1;
		}
		
		valueaxes = [
			{
				"id": "g1",
				"stackType": "regular",
				"axisAlpha": 0.2,
				"dashLength": 1,
				"position": "left"
			}
		];
	}
	return cArr;
}


function abformat (b64) {
	var a = atob(b64);
	var p = a.indexOf(' (');
	if ( p > -1 ) {
		a = a.substring(0, p);
	}
	return a;
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
		"valueAxes": valueaxes,
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
		"categoryField": valueArr[chartnum][0],
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
