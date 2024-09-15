let chart2, xAxis2, series2;

fetch('/most_negative_sentiment') // Replace with the actual endpoint
  .then((response) => response.json())
  .then((data) => {
    const formattedData = data.map((item) => ({
      title: item.title,
      score: item.sentiment.score,
      author: item.author,
      id: item.post_id,
    }));

    if (!chart2) {
      var root2 = am5.Root.new("most_negative_sentiment"); // Replace with actual container ID
      root2.setThemes([am5themes_Animated.new(root2)]);

      chart2 = root2.container.children.push(
        am5xy.XYChart.new(root2, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
          paddingRight: 1,
        })
      );

      var cursor2 = chart2.set("cursor", am5xy.XYCursor.new(root2, {}));
      cursor2.lineY.set("visible", false);

      var xRenderer2 = am5xy.AxisRendererX.new(root2, {
        minGridDistance: 30,
        minorGridEnabled: true,
      });

      xRenderer2.labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15,
      });

      xRenderer2.grid.template.setAll({
        location: 1,
      });

      xAxis2 = chart2.xAxes.push(
        am5xy.CategoryAxis.new(root2, {
          maxDeviation: 0.3,
          categoryField: "id",
          renderer: xRenderer2,
          tooltip: am5.Tooltip.new(root2, {}),
        })
      );

      var yRenderer2 = am5xy.AxisRendererY.new(root2, {
        strokeOpacity: 0.1,
      });

      var yAxis2 = chart2.yAxes.push(
        am5xy.ValueAxis.new(root2, {
          maxDeviation: 0.3,
          renderer: yRenderer2,
        })
      );

      series2 = chart2.series.push(
        am5xy.ColumnSeries.new(root2, {
          name: "Series 2",
          xAxis: xAxis2,
          yAxis: yAxis2,
          valueYField: "score",
          sequencedInterpolation: true,
          categoryXField: "id",
          tooltip: am5.Tooltip.new(root2, {
            labelText: "{valueY} score - {title}: {author}",
          }),
        })
      );

      series2.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
      });

      series2.columns.template.adapters.add(
        "fill",
        function (fill, target) {
          return chart2
            .get("colors")
            .getIndex(series2.columns.indexOf(target));
        }
      );

      series2.columns.template.adapters.add(
        "stroke",
        function (stroke, target) {
          return chart2
            .get("colors")
            .getIndex(series2.columns.indexOf(target));
        }
      );
    }

    console.log(formattedData);
    xAxis2.data.setAll(formattedData);
    series2.data.setAll(formattedData);
    series2.appear(1000);
    chart2.appear(1000, 100);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
