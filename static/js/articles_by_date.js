/*
  ***********************************************************
  articles_by_date
  ***********************************************************
  */
fetch("/articles_by_date")
  .then((res) => res.json())
  .then((data) => {
    const formattedData = data.map((item) => ({
      date: new Date(item._id).toLocaleDateString(),
      count: item.count,
    }));
    am5.ready(function () {
      var root = am5.Root.new("articles_by_date");
      const myTheme = am5.Theme.new(root);
      myTheme.rule("AxisLabel", ["minor"]).setAll({
        dy: 1,
      });
      myTheme.rule("Grid", ["minor"]).setAll({
        strokeOpacity: 0.08,
      });
      root.setThemes([am5themes_Animated.new(root), myTheme]);
      var chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          paddingLeft: 0,
        })
      );
      var cursor = chart.set(
        "cursor",
        am5xy.XYCursor.new(root, {
          behavior: "zoomX",
        })
      );
      cursor.lineY.set("visible", false);
      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0,
          categoryField: "date",
          renderer: am5xy.AxisRendererX.new(root, {
            minGridDistance: 30,
            minorGridEnabled: true,
            minorLabelsEnabled: false,
          }),
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      xAxis.get("renderer").labels.template.setAll({
        rotation: -90,
        centerY: am5.p50,
        centerX: am5.p100,
        paddingRight: 15,
      });
      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          renderer: am5xy.AxisRendererY.new(root, {}),
        })
      );
      var series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: "Article Count",
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "count",
          categoryXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}",
          }),
        })
      );
      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
        fill: am5.color(0xc3e6cb),
      });
      series.data.setAll(formattedData);
      xAxis.data.setAll(formattedData);
      P;
      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          sprite: am5.Circle.new(root, {
            radius: 5,
            fill: series.get("fill"),
          }),
        });
      });
      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, {
          orientation: "horizontal",
        })
      );
      series.appear(1000);
      chart.appear(1000, 100);
    });
  })
  .catch((err) => {
    console.log(err);
  });
