let chart1, xAxis1, series1;

fetch('/most_positive_sentiment')
  .then((response) => response.json())
  .then((data) => {
    const formattedData = data.map((item) => ({
      title: item.title,
      score: item.sentiment.score,
      author: item.author,
      id: item.post_id,
    }));

    if (!chart1) {
      var root1 = am5.Root.new("most_positive_sentiment");
      root1.setThemes([am5themes_Animated.new(root1)]);

      chart1 = root1.container.children.push(
        am5xy.XYChart.new(root1, {
          panX: true,
          panY: true,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
          paddingRight: 1,
        })
      );

      var cursor1 = chart1.set("cursor", am5xy.XYCursor.new(root1, {}));
      cursor1.lineY.set("visible", false);

      var xRenderer1 = am5xy.AxisRendererX.new(root1, {
        minGridDistance: 30,
        minorGridEnabled: true,
      });

      xRenderer1.labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15,
      });

      xRenderer1.grid.template.setAll({
        location: 1,
      });

      xAxis1 = chart1.xAxes.push(
        am5xy.CategoryAxis.new(root1, {
          maxDeviation: 0.3,
          categoryField: "id",
          renderer: xRenderer1,
          tooltip: am5.Tooltip.new(root1, {}),
        })
      );

      var yRenderer1 = am5xy.AxisRendererY.new(root1, {
        strokeOpacity: 0.1,
      });

      var yAxis1 = chart1.yAxes.push(
        am5xy.ValueAxis.new(root1, {
          maxDeviation: 0.3,
          renderer: yRenderer1,
        })
      );

      series1 = chart1.series.push(
        am5xy.ColumnSeries.new(root1, {
          name: "Series 1",
          xAxis: xAxis1,
          yAxis: yAxis1,
          valueYField: "score",
          sequencedInterpolation: true,
          categoryXField: "id",
          tooltip: am5.Tooltip.new(root1, {
            labelText: "{valueY} score - {title}: {author}",
          }),
        })
      );

      series1.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
      });

      series1.columns.template.adapters.add(
        "fill",
        function (fill, target) {
          return chart1
            .get("colors")
            .getIndex(series1.columns.indexOf(target));
        }
      );

      series1.columns.template.adapters.add(
        "stroke",
        function (stroke, target) {
          return chart1
            .get("colors")
            .getIndex(series1.columns.indexOf(target));
        }
      );
    }

    console.log(formattedData);
    xAxis1.data.setAll(formattedData);
    series1.data.setAll(formattedData);
    series1.appear(1000);
    chart1.appear(1000, 100);
  })
  .catch((error) => {
    console.error("Error:", error);
  });
