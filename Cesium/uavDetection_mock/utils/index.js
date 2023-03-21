// 根据两个经纬度，计算两点之间的距离 2D
export function getDistance(lngLat_1, lngLat_2) {
  var radLat1 = (lngLat_1[1] * Math.PI) / 180.0;
  var radLat2 = (lngLat_2[1] * Math.PI) / 180.0;
  var a = radLat1 - radLat2;
  var b = (lngLat_1[0] * Math.PI) / 180.0 - (lngLat_2[0] * Math.PI) / 180.0;
  var s =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin(a / 2), 2) +
          Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
      )
    );
  s = s * 6378.137; // EARTH_RADIUS;
  s = Math.round(s * 10000) / 10000;
  return s * 1000;
}

// 获取两个经纬度 的距离 3D
export function getDistance_3D(lngLat_1, height_1, lngLat_2, height_2) {
  const dis_2d = getDistance(lngLat_1, lngLat_2); // 平面距离
  const height_differ = Math.abs(height_2 - height_1); // 高度差异
  const dis_3d = Math.sqrt(dis_2d * dis_2d + height_differ * height_differ); // 开根号
  return Number(dis_3d.toFixed(2));
}

// 根据两个经纬度，测量方向角度
export function direction(first, last) {
  const a = ((90 - last[1]) * Math.PI) / 180;
  const b = ((90 - first[1]) * Math.PI) / 180;
  const AOC_BOC = ((last[0] - first[0]) * Math.PI) / 180;
  const cosc =
    Math.cos(a) * Math.cos(b) + Math.sin(a) * Math.sin(b) * Math.cos(AOC_BOC);
  const sinc = Math.sqrt(1 - cosc * cosc);
  const sinA = (Math.sin(a) * Math.sin(AOC_BOC)) / sinc;
  const A = (Math.asin(sinA) * 180) / Math.PI;
  let res = null;
  if (last[0] > first[0] && last[1] > first[1]) res = A;
  else if (last[0] > first[0] && last[1] < first[1]) res = 180 - A;
  else if (last[0] < first[0] && last[1] < first[1]) res = 180 - A;
  else if (last[0] < first[0] && last[1] > first[1]) res = 360 + A;
  else if (last[0] > first[0] && last[1] === first[1]) res = 90;
  else if (last[0] < first[0] && last[1] === first[1]) res = 270;
  else if (last[0] === first[0] && last[1] > first[1]) res = 0;
  else if (last[0] === first[0] && last[1] < first[1]) res = 180;
  return res;
}

// point-in-polygon库(判断点是否在多边形内)
// github地址：https://github.com/substack/point-in-polygon
export function pointInPolygon(point, vs) {
  var x = point[0],
    y = point[1];
  var inside = false;
  for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    var xi = vs[i][0],
      yi = vs[i][1];
    var xj = vs[j][0],
      yj = vs[j][1];
    var intersect =
      yi > y != yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// 深度克隆数据
export function deepClone(target) {
  let result;
  const BASE_TYPE = ["number", "string", "boolean", "function", "undefined"];
  if (BASE_TYPE.includes(typeof target)) {
    result = target;
  } else {
    if (Array.isArray(target)) {
      // 数组
      const newValue = [];
      target.forEach((item, index) => {
        newValue[index] = deepClone(item);
      });
      result = newValue;
    } else if (target instanceof Object) {
      // 对象
      const newValue = {};
      for (let key in target) {
        newValue[key] = deepClone(target[key]);
      }
      result = newValue;
    }
  }
  return result;
}

// 节流
export function throttle(callback, wait) {
  if (typeof callback !== 'function') throw new Error('callback need be a function!')
  wait = +wait
  if (isNaN(wait)) wait = 1000 // 判断是否为数字
  let timer = null, startTime = 0;
  // 返回要被执行的函数
  return function control(...params) {
    let nowTime = new Date().getTime()
    const remain = wait - (nowTime - startTime) // 触发的剩余时间
    if (remain <= 0) {
      // 触发
      callback.call(this, ...params) // 执行
      startTime = new Date().getTime() // 更新时间戳
      if (timer) {
        // 清除定时器
        clearTimeout(timer)
        timer = null
      }
    } else if (!timer) {
      timer = setTimeout(() => {
        callback.call(this, ...params);
        startTime = new Date().getTime(); // 更新时间戳
        if (timer) {
          // 清除定时器
          clearTimeout(timer);
          timer = null;
        }
      }, remain)
    }
  }
}
