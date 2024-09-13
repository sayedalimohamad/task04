fetch("/articles_by_word_count")
  .then((res) => res.json())
  .then((data) => {
    const formatted_data = data.map((item) => ({
      category: item._id,
      value: item.count,
    }));
    am5.ready(function () {
      var root = am5.Root.new("articles_by_word_count");
      root.setThemes([am5themes_Animated.new(root)]);
      var chart = root.container.children.push(
        am5radar.RadarChart.new(root, {
          panX: false,
          panY: false,
          wheelX: "none",
          wheelY: "none",
          startAngle: -84,
          endAngle: 264,
          innerRadius: am5.percent(40),
        })
      );
      var cursor = chart.set(
        "cursor",
        am5radar.RadarCursor.new(root, {
          behavior: "zoomX",
        })
      );
      cursor.lineY.set("forceHidden", true);
      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, {
          orientation: "horizontal",
          exportable: false,
        })
      );
      var xRenderer = am5radar.AxisRendererCircular.new(root, {
        minGridDistance: 30,
      });
      xRenderer.grid.template.set("forceHidden", true);
      var xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          maxDeviation: 0,
          categoryField: "category",
          renderer: xRenderer,
        })
      );
      var yRenderer = am5radar.AxisRendererRadial.new(root, {});
      yRenderer.labels.template.set("centerX", am5.p50);
      var yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          maxDeviation: 0.3,
          renderer: yRenderer,
          logarithmic: true,
        })
      );
      var series = chart.series.push(
        am5radar.RadarColumnSeries.new(root, {
          name: "Series 1",
          sequencedInterpolation: true,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: "value",
          categoryXField: "category",
        })
      );
      series.columns.template.setAll({
        cornerRadius: 5,
        tooltipText: "{valueY} articles have {categoryX} words",
      });
      series.columns.template.adapters.add("fill", function (fill, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });
      series.columns.template.adapters.add("stroke", function (stroke, target) {
        return chart.get("colors").getIndex(series.columns.indexOf(target));
      });
      for (var i = 2; i < data.length; i++) {
        formatted_data.push({
          category: i,
          value: Math.round(Math.random() * 100),
        });
      }
      xAxis.data.setAll(formatted_data);
      series.data.setAll(formatted_data);
      series.appear(1000);
      chart.appear(1000, 100);
    });
  })
  .catch((err) => {
    console.log(err);
  });
