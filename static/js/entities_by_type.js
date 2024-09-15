fetch("/entities_by_type")
  .then((res) => res.json())
  .then((data) => {
    var processedData = data.map((item) => ({
      value: item.count,
      category: item._id,
    }));
    am5.ready(function () {
      var root = am5.Root.new("entities_by_type");
      root.setThemes([am5themes_Animated.new(root)]);
      var chart = root.container.children.push(
        am5percent.PieChart.new(root, {
          layout: root.verticalLayout,
        })
      );
      var series = chart.series.push(
        am5percent.PieSeries.new(root, {
          alignLabels: true,
          calculateAggregates: true,
          valueField: "value",
          categoryField: "category",
        })
      );
      series.slices.template.setAll({
        tooltipText: "{category}: {value}",
        strokeWidth: 3,
        stroke: am5.color(0xffffff),
      });
      series.labelsContainer.set("paddingTop", 30);
      series.slices.template.adapters.add("radius", function (radius, target) {
        var dataItem = target.dataItem;
        var high = series.getPrivate("valueHigh");
        if (dataItem) {
          var value = target.dataItem.get("valueWorking", 0);
          return (radius * value) / high;
        }
        return radius;
      });
      series.data.setAll(processedData);
      var legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 15,
          marginBottom: 15,
        })
      );
      legend.data.setAll(series.dataItems);
      series.appear(1000, 100);
    });
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
