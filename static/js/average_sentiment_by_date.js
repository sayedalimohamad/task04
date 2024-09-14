fetch("/average_sentiment_by_date")
  .then((res) => res.json())
  .then((data) => {
    var processedData = data.map((item) => ({
      value: item.average_sentiment_score,
      year: new Date(item._id),
      label: item.average_sentiment_score > 0 ? "POSITIVE" : item.average_sentiment_score < 0 ? "NEGATIVE" : "NEUTRAL",
      count: item.count,
    }));
    am5.ready(function () {
      var root = am5.Root.new("average_sentiment_by_date");
      root.setThemes([am5themes_Animated.new(root)]);
      root.dateFormatter.setAll({
        dateFormat: "yyyy-MM-dd",
        dateFields: ["valueX"],
      });
      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          focusable: true,
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
        })
      );
      var easing = am5.ease.linear;
      var xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.5,
          baseInterval: {
            timeUnit: "day",
            count: 1,
          },
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 50,
            pan: "zoom",
            minorGridEnabled: true,
          }),
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 1,
          renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
        })
      );
      var series = chart.series.push(
        am5xy.SmoothedXLineSeries.new(root, {
          minBulletDistance: 10,
          connect: false,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          valueXField: "year",
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: "{count} texts | {label} - Average Score ({valueY})",
          }),
        })
      );
      series.fills.template.setAll({ fillOpacity: 0.2, visible: true });
      var rangeDataItem = yAxis.makeDataItem({
        value: 0,
        endValue: 1000,
      });
      var color = chart.get("colors").getIndex(3);
      var range = series.createAxisRange(rangeDataItem);
      range.strokes.template.setAll({
        stroke: color,
      });
      range.fills.template.setAll({
        fill: color,
        fillOpacity: 0.2,
        visible: true,
      });
      series.data.processor = am5.DataProcessor.new(root, {
        dateFormat: "yyyy-MM-dd",
        dateFields: ["year"],
      });
      series.data.setAll(processedData);
      series.bullets.push(function () {
        var circle = am5.Circle.new(root, {
          radius: 4,
          fill: series.get("fill"),
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 2,
        });
        circle.adapters.add("fill", function (fill, target) {
          var dataItem = circle.dataItem;
          if (dataItem.get("valueY") >= 0) {
            return color;
          }
          return fill;
        });
        return am5.Bullet.new(root, {
          sprite: circle,
        });
      });
      var cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          xAxis: xAxis,
        })
      );
      cursor.lineY.set("visible", false);
      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, { orientation: "horizontal" })
      );
      chart.appear(1000, 100);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
