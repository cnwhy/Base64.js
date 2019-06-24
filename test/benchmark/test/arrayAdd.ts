// 测试 向数组头部或者尾部添加数据, 最快方式
/*
结论

向Array尾部插入数据:
arr.push(v) 与 arr[length]=v 速度差不多;
一次添加多个 用 arr.push(v,v1,v2) 速度快过其它方法;

向Array尾部插入数据:
arr.unshift(v) 最差;
*/
import Benchmark from 'benchmark';
function getSuite() {
	return new Benchmark.Suite()
		.on('cycle', function(event: any) {
			console.log(event.target.toString());
		})
		.on('complete', function(this: any) {
			console.table(
				Array.from(this).map(v => {
					// @ts-ignore
					v.hzk = (v.hz / 1000).toFixed(2) + 'K';
					return v;
				}),
				['name', 'hzk']
			);
		});
}

const Max = 1000;

getSuite()
	.add('push', function() {
		var arr = [];
		var m = Max;
		while (m--) {
			arr.push(1);
		}
	})

	.add('arr[length]=1', function() {
		var arr = [];
		var m = Max;
		while (m--) {
			arr[arr.length] = 1;
		}
	})
	.add('splice', function() {
		var arr: any[] = [];
		var m = Max;
		while (m--) {
			arr.splice(arr.length, 0, 1);
		}
	})
	.add('push5', function() {
		var arr = [];
		var m = Max;
		while (m) {
			m -= 5;
			arr.push(1, 1, 1, 1, 1);
		}
	})
	.add('splice5', function() {
		var arr: any[] = [];
		var m = Max;
		while (m) {
			m -= 5;
			arr.splice(arr.length, 0, 1, 1, 1, 1, 1);
		}
	})
	.run();

getSuite().add('unshift', function() {
	var arr = [];
	var m = Max;
	while (m--) {
		arr.unshift(1);
	}
})
.add('SpliceShift', function() {
	var arr: any[] = [];
	var m = Max;
	while (m--) {
		arr.splice(0, 0, 1);
	}
})
.add('unshift5', function() {
	var arr: any[] = [];
	var m = Max;
	while (m) {
		m -= 5;
		arr.unshift(1,1,1,1,1);
	}
})
.add('SpliceShift5', function() {
	var arr: any[] = [];
	var m = Max;
	while (m) {
		m -= 5;
		arr.splice(0,0,1,1,1,1,1);
	}
})
.run();
