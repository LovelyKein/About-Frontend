import { getDistance_3D } from '../utils/index.js'

export default {
  data() {
    return {
      uavList: [
        // 无人机（中上）
        {
          id: "uav",
          name: "无人机",
          model_url: "/model/uav.glb",
          speed: 15,
          size: 30,
          // 无人机路径
          path: [
            {
              lngLat: [116.39052092127861, 39.96396548938188],
              height: 150,
            },
            {
              lngLat: [116.38801658305631, 39.944463637606944],
              height: 200,
            },
            {
              lngLat: [116.3921857659321, 39.932790869255086],
              height: 150,
            },
            {
              lngLat: [116.3906195500541, 39.921582517299285],
              height: 200,
            },
            {
              lngLat: [116.39172851678457, 39.91664090120842],
              height: 250,
            },
          ],
          params: {
            ray: false,
            radar: true,
            wireLess: true,
          },
        },
        // 滑翔机-蓝色（右上）
        {
          id: "blue",
          name: "滑翔机",
          model_url: "/model/aircraft_blue.glb",
          speed: 30,
          size: 40,
          // 无人机路径
          path: [
            {
              lngLat: [116.4511345239351, 39.93978225282688],
              height: 50,
            },
            {
              lngLat: [116.42083888954235, 39.92438371106203],
              height: 150,
            },
            {
              lngLat: [116.39916933422404, 39.916874059716456],
              height: 200,
            },
            {
              lngLat: [116.37748368775364, 39.915598259934846],
              height: 300,
            },
            {
              lngLat: [116.34937518853576, 39.913093550625526],
              height: 350,
            },
          ],
          params: {
            ray: true,
            radar: false,
            wireLess: true,
          },
        },
        // 无人机-橘色（右下）
        {
          id: "orange",
          name: "螺旋桨",
          model_url: "/model/aircraft_orange.glb",
          speed: 35,
          size: 30,
          // 无人机路径
          path: [
            {
              lngLat: [116.44476398254501, 39.880571781630316],
              height: 300,
            },
            {
              lngLat: [116.42274201030094, 39.89250176527469],
              height: 400,
            },
            {
              lngLat: [116.3968856874513, 39.90884566590876],
              height: 500,
            },
            {
              lngLat: [116.37992647368148, 39.921732738924646],
              height: 500,
            },
            {
              lngLat: [116.36343988073831, 39.93455366416138],
              height: 500,
            },
          ],
          params: {
            ray: true,
            radar: true,
            wireLess: false,
          },
        },
        // 轰炸机（中下）
        {
          id: "bomb",
          name: "轰炸机",
          model_url: "/model/bombcraft.glb",
          speed: 55,
          size: 40,
          // 无人机路径
          path: [
            {
              lngLat: [116.391091642157, 39.866033187699564],
              height: 600,
            },
            {
              lngLat: [116.3878717748104, 39.89475765331336],
              height: 700,
            },
            {
              lngLat: [116.39466900782882, 39.921579687121145],
              height: 800,
            },
            {
              lngLat: [116.39043866027968, 39.9385252341884],
              height: 700,
            },
            {
              lngLat: [116.39873802698757, 39.94873121402276],
              height: 900,
            },
            {
              lngLat: [116.4091736881684, 39.9532654126559],
              height: 1000,
            },
          ],
          params: {
            ray: false,
            radar: true,
            wireLess: true,
          },
        },
        // 战斗机（左下）
        {
          id: "fightcraft",
          name: "战斗机",
          model_url: "/model/fightcraft.glb",
          speed: 80,
          size: 30,
          // 无人机路径
          path: [
            {
              lngLat: [116.3210311991516, 39.892515455887825],
              height: 600,
            },
            {
              lngLat: [116.35346484622957, 39.90834948092536],
              height: 700,
            },
            {
              lngLat: [116.38592556223259, 39.91142471070527],
              height: 800,
            },
            {
              lngLat: [116.41203143028768, 39.92429477931792],
              height: 700,
            },
            {
              lngLat: [116.42816508870494, 39.93307275016868],
              height: 900,
            },
          ],
          params: {
            ray: true,
            radar: false,
            wireLess: true,
          },
        },
        // 热气球（左上）
        {
          id: "hotballoon",
          name: "热气球",
          model_url: "/model/hotballoon.glb",
          speed: 30,
          size: 30,
          // 无人机路径
          path: [
            {
              lngLat: [116.33029365939184, 39.94543210589283],
              height: 300,
            },
            {
              lngLat: [116.3533553994794, 39.93875090801065],
              height: 350,
            },
            {
              lngLat: [116.39436493881668, 39.918219973531734],
              height: 300,
            },
            {
              lngLat: [116.41430317065343, 39.908429137248675],
              height: 320,
            },
            {
              lngLat: [116.42018247589, 39.89825902106967],
              height: 380,
            },
            {
              lngLat: [116.42679200118512, 39.88996215497656],
              height: 400,
            },
          ],
          params: {
            ray: true,
            radar: true,
            wireLess: false,
          },
        },
      ],
      modelMap: new window.Map()
    };
  },
  methods: {
    // 添加模型
    createModel(url, lng, lat, height, size = 50, id, name) {
      const position = Cesium.Cartesian3.fromDegrees(lng, lat, height); // 经度、维度、高度
      // 无人机
      const uav = viewer.entities.add({
        id,
        name,
        position,
        model: {
          uri: url,
          minimumPixelSize: size,
          maximumScale: 20000,
        },
      });

      // 文字标签
      const label = viewer.entities.add({
        position,
        label: {
          id: id + "_label",
          text: name,
          font: "14px Helvetica",
          fillColor: Cesium.Color.SKYBLUE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -(size * 1.5)), // 文字偏移量
          horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
          verticalOrigin: Cesium.VerticalOrigin.TOP,
        },
      });
      return {
        uav,
        label,
      };
    },
    // 多点轨迹规划动画
    flyPathByMultipoint(path, speed = 10, id, uav, label) {
      let wait = 2000, timer = null, canNext = true;
      let done = false; // 是否需要终止
      let index = 0;
      // 当前时间
      let start_time = new Date().getTime() / 1000; // 当前时间的 秒
      // 处理路径
      let line_path_cartesian = [];
      const finish_cartesian = [];
      path.forEach((item) => {
        const { lngLat, height } = item;
        line_path_cartesian.push(
          Cesium.Cartesian3.fromDegrees(lngLat[0], lngLat[1], height)
        );
        finish_cartesian.push(
          Cesium.Cartesian3.fromDegrees(lngLat[0], lngLat[1], height)
        );
      });
      // 方向列表
      const direction_list = [];
      path.forEach((item, index, arr) => {
        if (index < arr.length - 1) {
          const index_position = Cesium.Cartesian3.fromDegrees(
            item.lngLat[0],
            item.lngLat[1],
            item.height
          );
          const next_position = Cesium.Cartesian3.fromDegrees(
            arr[index + 1].lngLat[0],
            arr[index + 1].lngLat[1],
            arr[index + 1].height
          );
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
              next_position,
              index_position,
              new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
          );
          direction_list.push(direction);
        }
      });
      // 四元数
      const quaternion_list = [];
      direction_list.forEach((item, index) => {
        quaternion_list.push(
          this.computedQuaternionFromPositionAndDirection(
            finish_cartesian[index],
            item
          )
        );
      });
      const line_entity = new Cesium.Entity({
        id: id + "_line",
        polyline: {
          // CallbackProperty 回调会在每一帧都运行一次
          positions: new Cesium.CallbackProperty(() => {
            if (done) {
              return [...finish_cartesian];
            }
            {
              // 加上此步骤，会大量增加计算量，可能导致卡顿和模拟效果
              // 此操作目的，更改速度后立马生效，而不是重新模拟才生效
              // speed = this.uavList.find((uavInfo) => uavInfo.id === id).speed;
            }
            const index_direction = direction_list[index]; // 当前依赖路径的索引的方向，单位向量
            const now_time = new Date().getTime() / 1000;
            const elapse_time = now_time - start_time;
            const increment = speed * elapse_time;
            const add_cartesian = new Cesium.Cartesian3(
              index_direction.x * increment,
              index_direction.y * increment,
              index_direction.z * increment
            ); // 向量增量

            // 当前位置
            let current_position = Cesium.Cartesian3.add(
              finish_cartesian[index],
              add_cartesian,
              new Cesium.Cartesian3()
            );

            finish_cartesian.forEach((_, i) => {
              if (i > index) {
                line_path_cartesian[i] = current_position; // 线条位置
              }
            });
            if (uav) {
              uav.position = current_position; // 无人机位置
              uav.orientation = quaternion_list[index]; // 四元数
            }
            if (label) {
              label.position = current_position; // 标签位置
            }
            // 节流
            if (canNext) {
              canNext = false
              timer = setTimeout(() => {
                this.detection(id)
                canNext = true
              }, wait)
            }

            const next_end = finish_cartesian[index + 1]; // 下一个转折终点
            const current_distance = Cesium.Cartesian3.distance(
              finish_cartesian[index],
              current_position
            ); // 当前位置与上一个转折点的距离
            const fragment_distance = Cesium.Cartesian3.distance(
              finish_cartesian[index],
              next_end
            ); // 上一个转折点到下一个转折点的距离
            if (current_distance >= fragment_distance - 0.1) {
              // 0.1 为容差值
              index++; // 索引增加
              start_time = new Date().getTime() / 1000; // 重置时间
              if (index >= direction_list.length) {
                done = true; // 终止算法
              }
            }
            return [...line_path_cartesian];
          }, false),
          width: 1,
          material: Cesium.Color.YELLOW,
          clampToGround: false,
        },
      });
      viewer.entities.add(line_entity);
      return line_entity;
    },
    // 根据位置和方向计算四元数
    computedQuaternionFromPositionAndDirection(position, direction) {
      const matrix_3 = Cesium.Transforms.rotationMatrixFromPositionVelocity(
        position,
        direction
      );
      const quaternion = Cesium.Quaternion.fromRotationMatrix(matrix_3);
      return quaternion;
    },
    // 辅助函数，用来在地图上获取点位
    createHandler() {
      const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas); // 鼠标事件柄
      handler.setInputAction((event) => {
        const earthPosition = viewer.scene.pickPosition(event.position);
        if (Cesium.defined(earthPosition)) {
          const cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
          const lng = Cesium.Math.toDegrees(cartographic.longitude);
          const lat = Cesium.Math.toDegrees(cartographic.latitude);
          const height = Number(cartographic.height.toFixed(2));
          const info = {
            lngLat: [lng, lat],
            height,
          };
          console.log(info);
        }
      }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
    },
    // 传递 entity 实体，返回经纬度、高度
    getEntityGPS(entity) {
      const cartographic = Cesium.Cartographic.fromCartesian(
        entity.position.getValue()
      );
      const lng = Cesium.Math.toDegrees(cartographic.longitude);
      const lat = Cesium.Math.toDegrees(cartographic.latitude);
      const height = Number(cartographic.height.toFixed(2));
      return {
        lngLat: [lng, lat],
        height,
      };
    },
    // 传递实体。获取两者距离
    calculateDistance(entity_1, entity_2) {
      // 目标_1
      const info_1 = this.getEntityGPS(entity_1);
      // 目标_2
      const info_2 = this.getEntityGPS(entity_2);

      // 计算距离
      const distance = getDistance_3D(
        info_1.lngLat,
        info_1.height,
        info_2.lngLat,
        info_2.height
      ).toFixed(2);
      return Number(distance); // 返回距离
    },
  },
};
