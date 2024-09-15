fetch('/most_positive_sentiment')
.then((response) => response.json())
.then((data) => {
  const formattedData = data.map((item) => ({
    title: item.title,
    count: item.sentiment.score,
    author: item.author,
    id: item.post_id,
  }));
  if (!chart) {
    var root = am5.Root.new("most_positive_sentiment");
    root.setThemes([am5themes_Animated.new(root)]);
    chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 1,
      })
    );
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);
    var xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });
    xRenderer.labels.template.setAll({
      rotation: -90,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });
    xRenderer.grid.template.setAll({
      location: 1,
    });
    xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "id",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    var yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });
    var yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      })
    );
    series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "count",
        sequencedInterpolation: true,
        categoryXField: "id",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY} score - {title}: {author}",
        }),
      })
    );
    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });
    series.columns.template.adapters.add(
      "fill",
      function (fill, target) {
        return chart
          .get("colors")
          .getIndex(series.columns.indexOf(target));
      }
    );
    series.columns.template.adapters.add(
      "stroke",
      function (stroke, target) {
        return chart
          .get("colors")
          .getIndex(series.columns.indexOf(target));
      }
    );
  }

  console.log(formattedData);
  xAxis.data.setAll(formattedData);
  series.data.setAll(formattedData);
  series.appear(1000);
  chart.appear(1000, 100);
})
.catch((error) => {
  console.error("Error:", error);
});