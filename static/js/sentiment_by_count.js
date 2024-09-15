fetch("/sentiment_by_count")
  .then((res) => {
    if (!res.ok) {
      throw new Error("Network response was not ok");
    }
    return res.json();
  })
  .then((data) => {
    var processedData = data.map((item) => ({
      score: item._id.score,
      count: item.count,
      label: item._id.label,
    }));
    processedData.sort((a, b) => a.score - b.score);

    // Store a copy of the original data for restoring it later
    var originalData = [...processedData];

    // amCharts code setup
    am5.ready(function () {
      var root = am5.Root.new("sentiment_by_count");
      root.setThemes([am5themes_Animated.new(root)]);

      var chart = root.container.children.push(
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

      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0.3,
          categoryField: "score",
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
          logarithmic: true,
          base: 10,
          min: 1,
          maxPrecision: 1,
          extraMax: 0.1,
        })
      );

      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Series 1",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count",
          categoryXField: "score",
          sequencedInterpolation: true,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      series.get("tooltip").label.adapters.add("text", function (text, target) {
        var dataItem = target.dataItem;
        if (dataItem && dataItem.dataContext) {
          var count = dataItem.dataContext.count;
          var score = dataItem.dataContext.score;
          var label = dataItem.dataContext.label;
          if (count > 1) {
            return count + " " + label + " texts have score " + score;
          } else {
            return count + " " + label + " text has score " + score;
          }
        }
        return text;
      });

      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
      });
      series.columns.template.adapters.add("fill", function (fill, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });
      series.columns.template.adapters.add("stroke", function (stroke, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });

      // Set initial data
      xAxis.data.setAll(processedData);
      series.data.setAll(processedData);
      series.appear(1000);
      chart.appear(1000, 100);

      // Get the checkbox element
      var checkbox = document.getElementById("hideOutliers");

      // Add event listener to the checkbox
      checkbox.addEventListener("change", function () {
        if (checkbox.checked) {
          // Hide values above 20000
          processedData = originalData.filter(function (item) {
            return item.count <= 20000;
          });
        } else {
          // Restore original data
          processedData = [...originalData];
        }

        // Update chart data
        xAxis.data.setAll(processedData);
        series.data.setAll(processedData);

        // Invalidate data to force a redraw
        chart.invalidateData();
      });
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
