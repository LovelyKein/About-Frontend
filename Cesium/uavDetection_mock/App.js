// window.CESIUM_BASE_URL = "/script/Cesium/"; // 设置 Cesium 静态资源基本路径
// 设置 cesium token
Cesium.Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjYjkyZWNjNC00NmVkLTQ3OTktOTUwOC0yODlmNjMxOTRjZjQiLCJpZCI6MTA4OTA1LCJpYXQiOjE2NjM4NDc3NTl9.D-ndvVOBsHIBY0doIFl4yJmr5iTE7ZEDLkZrZ4kMI9s";

// 设置 Cesium 初始化时的默认位置视角（中国大陆）
Cesium.Camera.DEFAULT_VIEW_RECTANGLE = Cesium.Rectangle.fromDegrees(
  89.5, // 西经
  20.4, // 南纬
  110.4, // 东经
  61.2 // 北纬
);

import uav_data from "./mixin/uav_data.js";
import { deepClone } from "./utils/index.js";

export default {
  data() {
    return {
      center: [116.39122824, 39.91560456], // 北京天安门
      centerCartesian: null, // 中心的笛卡尔坐标系
      is_3d: false,
      tilesOsm: null,
      isMocking: false,
      // 站点列表
      stationList: [
        {
          id: "beijing",
          name: "北京天安门固定站",
          lng: 116.39122824,
          lat: 39.91560456,
        },
      ],
      stationMap: new window.Map(), // 站点地图
      clickInfo: {
        params: {
          ray: false,
          radar: false,
          wireLess: false,
        },
      }, // 点击的目标的信息
      clickLnglat: { lngLat: [], height: 0 },
      timer: null
    };
  },
  mixins: [uav_data],
  mounted() {
    if (localStorage.getItem("uavList")) {
      const result = JSON.parse(localStorage.getItem("uavList"));
      if (Array.isArray(result)) {
        this.uavList = result;
      }
    }
    window.viewer = new Cesium.Viewer("map_box", {
      geocoder: false,
      homeButton: true,
      infoBox: false,
      sceneModePicker: false,
      baseLayerPicker: false,
      navigationHelpButton: false,
      animation: false,
      timeline: false,
      fullscreenButton: false,
      vrButton: false,
      scene3DOnly: true,
      shouldAnimate: true,
      terrainProvider: new Cesium.createWorldTerrain({
        requestVertexNormals: true,
        requestWaterMask: true,
      }),
    });

    this.centerCartesian = Cesium.Cartesian3.fromDegrees(
      this.center[0],
      this.center[1],
      0
    );

    // OSM 数据
    this.tilesOsm = viewer.scene.primitives.add(
      new Cesium.createOsmBuildings()
    );
    this.tilesOsm.show = false;

    viewer.cesiumWidget.creditContainer.style.display = "none";
    viewer.scene.globe.depthTestAgainstTerrain = true;

    this.goHome();
    this.createStation();
    this.createHandler();
  },
  beforeDestroy() {
    viewer.destroy();
    window.viewer = null;
    this.clearData()
  },
  methods: {
    // 点击视角切换按钮的回调函数
    handleChangePerspective() {
      this.is_3d = !this.is_3d;
      this.tilesOsm.show = this.is_3d ? true : false;
    },
    // 点击模拟按钮的回调功能
    toggleAnimation() {
      this.isMocking = !this.isMocking;
      if (this.isMocking) {
        this.uavList.forEach((item) => {
          const { id, name, model_url, speed, size, path } = item;
          const [lng, lat] = path[0].lngLat;
          const { height } = path[0];
          const { uav, label } = this.createModel(
            model_url,
            lng,
            lat,
            height,
            size,
            id,
            name
          );
          const line = this.flyPathByMultipoint(path, speed, id, uav, label);
          this.modelMap.set(id, { uav, label, line });
          // viewer.flyTo(viewer.entities);
        });
      } else {
        if (this.modelMap.size) {
          this.modelMap.forEach((value) => {
            const { uav, label, line } = value;
            viewer.entities.remove(uav);
            viewer.entities.remove(label);
            viewer.entities.remove(line);
          });
          this.modelMap.clear();
        }
        // viewer.camera.flyHome();
        // 清空数据
        this.clearData();
        this.goHome();
      }
    },
    // 回到初始位置
    goHome() {
      viewer.scene.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(...this.center, 20000),
      });
    },
    // 绘制站点
    createStation() {
      this.stationList.forEach((item) => {
        const stationEntites = this.addStation(item.lng, item.lat, item.id);
        this.stationMap.set(item.id, stationEntites);
      });
    },
    // 绘制 三维 站点区域范围
    addStation(lng, lat, id) {
      const position = Cesium.Cartesian3.fromDegrees(lng, lat, 0);
      // 半球体 5000m
      const radius_5000 = new Cesium.Entity({
        id: id + "_radius_5000",
        position, // 圆心的位置 当高度等于0的时候，就是半个球体在外面
        ellipsoid: {
          radii: new Cesium.Cartesian3(5000.0, 5000.0, 5000.0), // 分别标识，左右，前后，上下的的高度
          material: new Cesium.Color(0, 0.3, 0.9, 0.15),
        },
      });

      // 半球体 2000m
      const radius_2000 = new Cesium.Entity({
        id: id + "_radius_3000",
        position,
        ellipsoid: {
          radii: new Cesium.Cartesian3(2000.0, 2000.0, 2000.0),
          material: new Cesium.Color(0.8, 0.4, 0, 0.2),
        },
      });

      let num = 1;
      setInterval(() => {
        num = num + 0.1;
      }, 100);

      function getheadingPitchRollQuaternion(time, result) {
        return Cesium.Transforms.headingPitchRollQuaternion(
          position,
          new Cesium.HeadingPitchRoll(num, 0, 0.0)
        );
      }
      // 动态扫描
      // const radius_dynamic = new Cesium.Entity({
      //   id: id + "_radius_dynamic",
      //   position,
      //   orientation: new Cesium.CallbackProperty(
      //     getheadingPitchRollQuaternion,
      //     false
      //   ),
      //   // rotation: new Cesium.CallbackProperty(getRotationValue, false),
      //   // stRotation: new Cesium.CallbackProperty(getRotationValue, false),
      //   ellipsoid: {
      //     radii: new Cesium.Cartesian3(5000.0, 5000.0, 5000.0),
      //     innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
      //     minimumClock: Cesium.Math.toRadians(-15.0), //椭球体的最小时钟角。
      //     maximumClock: Cesium.Math.toRadians(15.0),
      //     minimumCone: Cesium.Math.toRadians(45.0), // 上下高度  椭球体最小锥角。锥体高度
      //     maximumCone: Cesium.Math.toRadians(125), // 左右宽度
      //     material: Cesium.Color.RED.withAlpha(0.1),
      //     outline: true,
      //     outlineColor: Cesium.Color.RED.withAlpha(0.15),
      //     outlineWidth: 1,
      //   },
      // });

      viewer.entities.add(radius_5000);
      viewer.entities.add(radius_2000);
      // viewer.entities.add(radius_dynamic);

      return [radius_5000, radius_2000];
    },
    // 点击表格行的回调
    handleRowClick(item) {
      const cloneData = deepClone(item);
      this.clickInfo = cloneData;
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.calculateLnglatById(this.clickInfo.id)
        }, 1000)
      }
    },
    // 根据 ID 计算目标 uav 的经纬度
    calculateLnglatById(id) {
      const result = {
        lngLat: [],
        height: 0,
      };
      if (id === this.clickInfo.id) {
        if (this.modelMap.size) {
          const { uav } = this.modelMap.get(id);
          const { lngLat, height } = this.getEntityGPS(uav);
          result.lngLat = lngLat;
          result.height = height;
        }
      }
      this.clickLnglat = { ...result };
    },
    // 点击清除选中
    handleCancel() {
      if (!this.clickInfo.id) return false;
      this.clearData();
      this.goHome();
    },
    // 点击确认修改的回调
    handleConfirm() {
      if (this.clickInfo.id) {
        const index = this.uavList.findIndex(
          (item) => item.id === this.clickInfo.id
        );
        this.uavList.splice(index, 1, deepClone(this.clickInfo));
        this.calculateLnglatById(this.clickInfo.id);
        localStorage.setItem("uavList", JSON.stringify(this.uavList));
      } else {
        window.alert("请先选中目标");
      }
    },
    // 点击视频捕捉的回调
    handleVideo() {
      console.log('video')
    },
    // 绘制带指向性的锥体
    createCone(direction, position, radius = 5000) {
      const cone = new Cesium.Entity({
        position,
        orientation: this.computedQuaternionFromPositionAndDirection(
          position,
          direction
        ),
        ellipsoid: {
          radii: new Cesium.Cartesian3(radius, radius, radius),
          innerRadii: new Cesium.Cartesian3(1.0, 1.0, 1.0),
          minimumClock: Cesium.Math.toRadians(-2.0), //椭球体的最小时钟角。 // heading
          maximumClock: Cesium.Math.toRadians(2.0),
          minimumCone: Cesium.Math.toRadians(88), // 上下高度  椭球体最小锥角。锥体高度
          maximumCone: Cesium.Math.toRadians(92), // 左右宽度
          material: Cesium.Color.RED.withAlpha(0.2),
          outline: true,
          outlineColor: Cesium.Color.RED.withAlpha(0.2),
          outlineWidth: 1,
        },
      });
      return cone;
    },
    // 清除数据
    clearData() {
      this.clickInfo = {
        params: {
          ray: false,
          radar: false,
          wireLess: false,
        },
      };
      this.clickLnglat = { lngLat: [], height: 0 };
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
    },
    // 进行探测模拟
    detection(id) {
      if (!this.modelMap.size) return false;
      // this.calculateLnglatById(id) // 在这里计算会报错
      const { uav, label, line } = this.modelMap.get(id)
      if (!uav && !label && !line) return false;
      const stationEntity = viewer.entities.getById(
        `${this.stationList[0].id}_radius_5000`
      );
      const distance = this.calculateDistance(uav, stationEntity);
      if (distance <= 5000) {
        const uavPosition = uav.position.getValue(); // 无人机位置
        // 找到对应的参数
        const { params } = this.uavList.find((info) => info.id === id) || {};
        const stateArr = Object.values(params);
        const isShow = stateArr.some((bol) => bol);
        // 雷达
        if (params.radar) {
          uav.show = true;
          label.show = true;
          line.show = true;
        } else {
          uav.show = false;
          label.show = false;
          line.show = false;
        }
        // uav.show = isShow;
        // label.show = isShow;
        // line.show = isShow;
        // 频谱
        if (params.wireLess) {
          // 无人机与站点的方向
          const direction = Cesium.Cartesian3.normalize(
            Cesium.Cartesian3.subtract(
              uavPosition,
              this.centerCartesian,
              new Cesium.Cartesian3()
            ),
            new Cesium.Cartesian3()
          );
          const cone = this.createCone(direction, this.centerCartesian);
          viewer.entities.add(cone);
          setTimeout(() => {
            cone.show = false;
            viewer.entities.remove(cone);
          }, 500);
        }
      }
    },
  },
  template: `
    <div class="contanier">
      <div id="map_box" />
      <div class="bottom_btn">
        <button @click="toggleAnimation" :class="{stop: isMocking}" class="mock">{{isMocking ? '停止模拟' : '开始模拟'}}</button>
        <button @click="handleChangePerspective" class="perspective">{{is_3d ? '隐藏建筑' : '显示建筑'}}</button>
      </div>
      <div class="info_panel">
        <div class="panel is_tabel">
          <h3>探测列表</h3>
          <table class="target_list" border="0" cellspacing="0" cellpadding="0">
            <tr class="t_header">
              <th>目标类型</th>
              <th>飞行速度</th>
              <th>红外参数</th>
              <th>雷达参数</th>
              <th>无线电参数</th>
            </tr>
            <tbody class="t_body">
              <tr v-for="item in uavList" :key="item.id" @click="handleRowClick(item)">
                <td>{{item.name}}</td>
                <td>{{item.speed}}/s</td>
                <td>{{item.params.ray ? '光学可见' : '光学隐身'}}</td>
                <td>{{item.params.radar ? '雷达可探' : '雷达隐身'}}</td>
                <td>{{item.params.wireLess ? '频谱可见' : '无线静默'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="panel">
          <h3>目标信息</h3>
          <div class="target_info">
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">目标ID</span>
              <span class="info_value">{{clickInfo.id || '/'}}</span>
            </div>
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">目标类型</span>
              <span class="info_value">{{clickInfo.name || '/'}}</span>
            </div>
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">经度</span>
              <span class="info_value">{{clickLnglat.lngLat[0] || '/'}}</span>
            </div>
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">纬度</span>
              <span class="info_value">{{clickLnglat.lngLat[1] || '/'}}</span>
            </div>
            <div class="info_item" :style="{width: '100%'}">
              <span class="info_label">高度</span>
              <span class="info_value">{{clickLnglat.height || '/'}}</span>
            </div>
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">目标速度</span>
              <input class="info_input" type='text' v-model.number="clickInfo.speed" />
            </div>
            <div class="info_item" :style="{width: '46%'}">
              <span class="info_label">目标尺寸</span>
              <input class="info_input" type='text' v-model.number="clickInfo.size" />
            </div>
            <div class="info_item" :style="{width: '30%'}">
              <span class="info_label center">红外可见</span>
              <input class="info_radio center" type='checkbox' v-model="clickInfo.params.ray"/>
            </div>
            <div class="info_item" :style="{width: '30%'}">
              <span class="info_label center">雷达可见</span>
              <input class="info_radio center" type='checkbox' v-model="clickInfo.params.radar" />
            </div>
            <div class="info_item" :style="{width: '30%'}">
              <span class="info_label center">频谱可见</span>
              <input class="info_radio center" type='checkbox' v-model="clickInfo.params.wireLess" />
            </div>
          </div>
          <div class="btn">
            <button class="video" @click="handleVideo" v-if="clickInfo.params.ray">视频捕捉</button>
            <button class="cancel" @click="handleCancel">清除选中</button>
            <button class="confirm" @click="handleConfirm">确认修改</button>
          </div>
        </div>
      </div>
    </div>
  `,
};
