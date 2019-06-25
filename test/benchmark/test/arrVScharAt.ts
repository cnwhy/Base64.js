// 比较 str.charAt 和 arr[index]
/*
	arr[index] 快过 str.charAt;
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
const STR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const ARR = STR.split('');
const getIndexs: number[] = [];
for (let i = 0; i < Max; i++) {
	getIndexs.push((Math.random() * 64) >> 0);
}

getSuite()
	.add('arr[index]', function() {
		getIndexs.forEach(v => {
			var k = ARR[v];
		});
	})
	.add('str.charAt', function() {
		getIndexs.forEach(v => {
			var k = STR.charAt(v);
		});
	})
	.add('str[index]', function() {
		getIndexs.forEach(v => {
			var k = STR[v];
		});
	})
	.run();
