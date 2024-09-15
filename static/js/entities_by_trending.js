fetch("/entities_by_trending")
  .then((res) => res.json())
  .then((data) => {
    var processedData = data.map((item) => ({
      value: item.count,
      category: item.word + " - " + item.type + " ",
    }));
    am5.ready(function () {
      var root = am5.Root.new("entities_by_trending");
      root.setThemes([am5themes_Animated.new(root)]);
      var chart = root.container.children.push(
        am5percent.SlicedChart.new(root, {
          layout: root.verticalLayout,
        })
      );
      var series = chart.series.push(
        am5percent.FunnelSeries.new(root, {
          alignLabels: false,
          orientation: "vertical",
          valueField: "value",
          categoryField: "category",
        })
      );
      series.data.setAll(processedData);
      series.appear();
      var legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 15,
          marginBottom: 15,
        })
      );
      legend.data.setAll(series.dataItems);
      chart.appear(1000, 100);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
