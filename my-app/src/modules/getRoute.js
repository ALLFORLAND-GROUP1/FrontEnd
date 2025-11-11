export async function getRoute(start, end, apitype) {
  // console.log(start, end)
  var res = null
  if (apitype == 'ors'){
    res = await fetch(
      `http://localhost:8080/api/route?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&mode=foot-walking&apitype=${apitype}`
      // `http://localhost:5000/route?start=${start.lng},${start.lat}&end=${end.lng},${end.lat}&mode=foot-walking&apitype=${apitype}`
    );
  }
  else if (apitype == 'gh'){
    res = await fetch(
      `http://localhost:8080/api/route?start=${start.lat},${start.lng}&end=${end.lat},${end.lng}&mode=foot-walking&apitype=${apitype}`
      // `http://localhost:5000/route?start=${start.lat},${start.lng}&end=${end.lat},${end.lng}&mode=foot-walking&apitype=${apitype}`
    );
  }
  const data = await res.json();
  // node 프론트일경우 data.features, spring 백엔드일경우 data.data.features로 접근
  if (typeof data.error === "undefined") {
    if (apitype=='ors'){
      // data = data.data
      // console.log(data.data.features)
      const coords = data.data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
      const info = {
        distance: (data.data.features[0].properties.summary.distance / 1000).toFixed(2), // km
        duration: (data.data.features[0].properties.summary.duration / 60).toFixed(0),  // min
      };
      return { coords, info };
    }
    else if (apitype == 'gh'){
      const coords = data.data.paths[0].points.coordinates.map(c => [c[1], c[0]])
      const info = {
        distance: (data.data.paths[0].distance / 1000).toFixed(2), // km
        duration: (data.data.paths[0].time / 1000 / 60).toFixed(0),  // min
      };
      return { coords, info };
    }
  } else {
    alert('길 찾기 실패')
    console.log("길 찾기 실패");
    return null;
  }
}