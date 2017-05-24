//定义3层结构，分别放置图片、连线、和点击层
var clickBox = $('#clickBox');
var lineBox = $('#lineBox');
var imgBox = $('#imgBox');

//设置棋盘
var Stage = {
	// X轴20个格子，Y轴20个格子
	xNum : 10,
	yNum : 10,
	// 每个格子宽高40px
	width : 40,
}

//用来存放连连看的元素信息
var imgBoxArray = [];

//连连看元素类型
var imgElement = ['t1','t2','t3','t4','t5'];

//关卡
var level = 0;

//关卡地图，目前2个关卡
var levelMap = [];
levelMap[0] = [
	[1,1,1,1,1,1,1,1,0,0],
	[1,1,1,1,1,1,1,0,0,0],
	[1,1,1,1,1,1,0,0,0,1],
	[1,1,1,1,1,0,0,0,1,1],
	[1,1,1,1,0,0,0,1,1,1],
	[1,1,1,0,0,0,1,1,1,1],
	[1,1,0,0,0,1,1,1,1,1],
	[1,0,0,0,1,1,1,1,1,1],
	[0,0,0,1,1,1,1,1,1,1],
	[0,0,1,1,1,1,1,1,1,1]
];
levelMap[1] = [
	[1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1],
	[1,1,1,0,0,0,0,1,1,1],
	[1,1,1,0,0,0,0,1,1,1],
	[1,1,1,0,0,0,0,1,1,1],
	[1,1,1,0,0,0,0,1,1,1],
	[1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1],
	[1,1,1,1,1,1,1,1,1,1]
]

//点击记录
var clickRecord = {
	First : false,
	Second : false
}

//转折点记录
var turnPosition = {
	First : false,
	Second : false
}

////////////////////////////////////////////////////////////

init();

//初始化游戏
function init(){
	initStageBox();
	pushImg(level);
}

//初始化棋盘
function initStageBox(){
	for (var i = 0; i <= Stage.xNum-1; i ++){
		imgBoxArray.push([]);
		for (var j = 0; j <= Stage.yNum-1; j ++){
			imgBoxArray[i].push(false);

			var boxLeft = i * Stage.width + 'px';
			var boxtop  = j * Stage.width + 'px';

			$(clickBox).append('<li id="click_'+i+'_'+j+'" style="left:'+boxLeft+'; top:'+boxtop+'; width:'+Stage.width+'px; height:'+Stage.width+'px;" data-x="'+i+'" data-y="'+j+'"></li>');
			$(lineBox).append('<li id="line_'+i+'_'+j+'" style="left:'+boxLeft+'; top:'+boxtop+'; width:'+Stage.width+'px; height:'+Stage.width+'px;" data-x="'+i+'" data-y="'+j+'"></li>');
			$(imgBox).append('<li id="img_'+i+'_'+j+'" style="left:'+boxLeft+'; top:'+boxtop+'; width:'+Stage.width+'px; height:'+Stage.width+'px;" data-x="'+i+'" data-y="'+j+'"></li>');
		}
	}

	//初始化点击事件
	$('#clickBox > li').click(function(){
		var x = $(this).attr('data-x');
		var y = $(this).attr('data-y');
	
		//点击第一个元素
		if(clickRecord.First === false){
			//点击空白元素不响应
			if(imgBoxArray[x][y] === false){
				return false;
			}else{
				clickRecord.First = [x,y];
			}
		}
		//点击第二个元素
		else{
			//点击空白元素不响应
			if(imgBoxArray[x][y] === false){
				return false;
			}
			clickRecord.Second = [x,y];
			if(clickRecord.First[0] == clickRecord.Second[0] && clickRecord.First[1] == clickRecord.Second[1]){
				alert("请不要点击同一个元素！");
			}else{
				//判断点击的是否是同一个元素，不是同样元素的不处理
				if(imgBoxArray[clickRecord.First[0]][clickRecord.First[1]] == imgBoxArray[clickRecord.Second[0]][clickRecord.Second[1]]){
					connectScan();
				}
			}
			clickRecord = {
				First : false,
				Second : false
			}
		}
	})
}

//初始化关卡地图，传入关卡地图的模板号
function pushImg(levelMap_i){
	//总元素个数
	var num = 0;
	for (var i = 0; i <= levelMap[levelMap_i].length-1; i++){
		for (var j = 0; j <= levelMap[levelMap_i][i].length-1; j++){
			if(levelMap[levelMap_i][i][j] === 1){
				num++;
			}
		}
	}

	//计算每个元素的个数
	var oneImgNum = Math.floor(num/imgElement.length);
	var oneImgNum_last = oneImgNum + num - (oneImgNum*imgElement.length);
	var imgElementNum = [];
	for(var i=0; i<=imgElement.length-1; i++){
		if(i == imgElement.length-1){
			imgElementNum.push({
				type : imgElement[i],
				num : oneImgNum_last
			});
		}else{
			imgElementNum.push({
				type : imgElement[i],
				num : oneImgNum
			});
		}
	}

	//向数组写入每个格子的元素信息
	for (var i = 0; i <= levelMap[levelMap_i].length-1; i++){
		for (var j = 0; j <= levelMap[levelMap_i][i].length-1; j++){
			if(levelMap[levelMap_i][i][j] === 1){
				//随机获取格子类型
				var type_i = getRandom(imgElementNum);
				imgBoxArray[i][j] = imgElement[type_i];
				imgElementNum[type_i].num--;

				//向格子写入元素图片
				$('#img_'+i+'_'+j).html(type_i);
			}
		}
	}
}

//元素连接扫描，返回扫描结果ture or false
function connectScan(){
	//修改两个元素的排序
	var imgFirst, imgSecond;
	imgFirst  = clickRecord.First;
	imgSecond = clickRecord.Second;
	/*if(clickRecord.First[0] < clickRecord.Second[0]){
		imgFirst  = clickRecord.First;
		imgSecond = clickRecord.Second;
	}else if(clickRecord.First[0] > clickRecord.Second[0]){
		imgFirst  = clickRecord.Second;
		imgSecond = clickRecord.First;
	}else{
		if(clickRecord.First[1] < clickRecord.Second[1]){
			imgFirst  = clickRecord.First;
			imgSecond = clickRecord.Second;
		}else{
			imgFirst  = clickRecord.Second;
			imgSecond = clickRecord.First;
		}
	}*/
	//console.log(imgFirst, imgSecond);

	//扫描逻辑，广度优先搜索
	//存放每个端点的坐标，用于检查断点坐标是否就是目标坐标
	var endImg = [];
	/*
		首次扫描，此处是未折弯的第一条线扫描
	*/
	//存放第一条线的广度探索范围
	var lineOne = [];
	//存放第二条线的广度探索范围
	var lineTwo = [];
	//x轴正向扫描
	for(var i=imgFirst[0]; i<=Stage.xNum-1; i++){
		if(i == imgFirst[0]){continue;}
		if(imgBoxArray[i][imgFirst[1]] === false){
			lineOne.push([i,imgFirst[1]]);
		}else{
			endImg.push([i,imgFirst[1]]);
			break;
		}
	}
	//x轴反向扫描
	for(var i=imgFirst[0]-1; i>=0; i--){
		if(imgBoxArray[i][imgFirst[1]] === false){
			lineOne.push([i,imgFirst[1]]);
		}else{
			endImg.push([i,imgFirst[1]]);
			break;
		}
	}
	//y轴正向扫描
	for(var i=imgFirst[1]; i<=Stage.yNum-1; i++){
		if(i == imgFirst[1]){continue;}
		if(imgBoxArray[imgFirst[0]][i] === false){
			lineOne.push([imgFirst[0],i]);
		}else{
			endImg.push([imgFirst[0],i]);
			break;
		}
	}
	//y轴反向扫描
	for(var i=imgFirst[1]-1; i>=0; i--){
		if(imgBoxArray[imgFirst[0]][i] === false){
			lineOne.push([imgFirst[0],i]);
		}else{
			endImg.push([imgFirst[0],i]);
			break;
		}
	}

	//检查端点列表中是否有目标坐标
	if(checkImgList()){
		console.log('连接成功，加载连接成功的函数');
		return false;
	}

	/*
		二次扫描，此处是第一次折弯的第二条线扫描
		X轴方向的只进行Y轴扫描，Y轴方向的只进行X轴扫描
	*/
	endImg = [];
	Outermost:
	for(var i=0; i<=lineOne.length-1; i++){
		//记录第一转折点
		turnPosition.First = lineOne[i];
		if(lineOne[i][0] == imgFirst[0]){
			//Y轴和原点一致，沿着Y轴扫描X轴方向
			//console.log('只扫描X',lineOne[i]);
			//x轴正向扫描
			for(var j=lineOne[i][0]; j<=Stage.xNum-1; j++){
				if(j == lineOne[i][0]){continue;}
				if(imgBoxArray[j][lineOne[i][1]] === false){
					//console.log(j,lineOne[i][1]);
					lineTwo.push([j,lineOne[i][1],'y']);//此处的y表示，第三次扫描在Y轴上扫描
				}else{
					//判断终点是否是目标，是则跳出循环，不是则记录折点
					if(!checkImg([j,lineOne[i][1]])){
						break Outermost;
					}
					endImg.push([j,lineOne[i][1]]);
					break;
				}
			}
			//x轴反向扫描
			for(var j=lineOne[i][0]; j>=0; j--){
				if(j == lineOne[i][0]){continue;}
				if(imgBoxArray[j][lineOne[i][1]] === false){
					//console.log(j,lineOne[i][1]);
					lineTwo.push([j,lineOne[i][1],'y']);//此处的y表示，第三次扫描在Y轴上扫描
				}else{
					//判断终点是否是目标，不是则记录折点
					if(!checkImg([j,lineOne[i][1]])){
						break Outermost;
					}
					endImg.push([j,lineOne[i][1]]);
					break;
				}
			}
			//console.log('------------------------------');
		}else{
			//X轴和原点一致，沿着X轴扫描Y轴方向
			//console.log('只扫描Y',lineOne[i]);
			//y轴正向扫描
			for(var j=lineOne[i][1]; j<=Stage.yNum-1; j++){
				if(j == lineOne[i][1]){continue;}
				if(imgBoxArray[lineOne[i][0]][j] === false){
					//console.log(lineOne[i][0],j);
					lineTwo.push([lineOne[i][0],j,'x']);//此处的x表示，第三次扫描在x轴上扫描
				}else{
					//判断终点是否是目标，不是则记录折点
					if(!checkImg([lineOne[i][0],j])){
						break Outermost;
					}
					endImg.push([lineOne[i][0],j]);
					break;
				}
			}
			//y轴反向扫描
			for(var j=lineOne[i][1]; j>=0; j--){
				if(j == lineOne[i][1]){continue;}
				if(imgBoxArray[lineOne[i][0]][j] === false){
					//console.log(lineOne[i][0],j);
					lineTwo.push([lineOne[i][0],j,'x']);//此处的x表示，第三次扫描在x轴上扫描
				}else{
					//判断终点是否是目标，不是则记录折点
					if(!checkImg([lineOne[i][0],j])){
						break Outermost;
					}
					endImg.push([lineOne[i][0],j]);
					break;
				}
			}
			//console.log('------------------------------');
		}
	}
	console.log(turnPosition.First);
	console.log(lineTwo);

	//检查端点列表中是否有目标坐标
	if(checkImgList()){
		console.log('连接成功，加载连接成功的函数');
		return false;
	}

	$('#line_'+turnPosition.First[0]+'_'+turnPosition.First[1]).html("x");

	/*for(var i=0; i<=endImg.length-1; i++){
		$('#line_'+endImg[i][0]+'_'+endImg[i][1]).html("x");
	}*/

	//检查端点是否是目标坐标
	function checkImg(img){
		if(img[0] == imgSecond[0] && img[1] == imgSecond[1]){
			return true;
		}else{
			return false;
		}
	}

	//检查端点列表中是否有目标坐标
	function checkImgList(){
		var ok = false;
		for(var i=0; i<=endImg.length-1; i++){
			if(endImg[i][0] == imgSecond[0] && endImg[i][1] == imgSecond[1]){
				ok = true;
				break;
			}
		}
		if(ok){
			return true;
		}else{
			return false;
		}
	}
}

//输入一个数组，返回一个随机结果
function getRandom(imgElementNum){
	/*
		输入的数组
		[
			{num: 14, type: 't1'},
			{num: 14, type: 't2'}
		]
	*/
	var numPool = [];
	for(var i=0; i<=imgElementNum.length-1; i++){
		if(imgElementNum[i].num > 0){
			numPool.push(i);
		}
	}
	var num = getRandomNumForNumArray(numPool,1);
	return num[0][0];
}

//从数组里面随机获取N个数字
function getRandomNumForNumArray(arr,n){
	//原数组arr [0,1,2,3,4,5,6,7,8,9,10,11]
	//输出数组
	var out = [];
	//输出个数
	var num = n;
	while(out.length < num){
	    var temp = (Math.random()*arr.length) >> 0;
	    out.push(arr.splice(temp,1));
	}
	return out;
}