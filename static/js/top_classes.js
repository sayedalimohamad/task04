/*
  ***********************************************************
  top_classes
  ***********************************************************
  */
document.getElementById("itemSelector").addEventListener("change", updateChart);
function updateChart() {
  const selectedValue = document.getElementById("itemSelector").value;
  fetch("/top_classes")
    .then((response) => response.json())
    .then((data) => {
      var processedData = data.map((item) => ({
        value: item.count,
        category: item._id.value,
      }));
      processedData.sort((a, b) => b.value - a.value);
      if (selectedValue !== "all") {
        processedData = processedData.slice(0, parseInt(selectedValue));
      }
      series.data.setAll(processedData);
      legend.data.setAll(series.dataItems);
      series.appear(1000, 100);
    })
    .catch((error) => {
      console.error("Error fetching data:", error);
    });
}
am5.ready(function () {
  var root = am5.Root.new("top_classes");
  root.setThemes([am5themes_Animated.new(root)]);
  var chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
    })
  );
  series = chart.series.push(
    am5percent.PieSeries.new(root, {
      alignLabels: true,
      calculateAggregates: true,
      valueField: "value",
      categoryField: "category",
    })
  );
  series.slices.template.setAll({
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
  legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.p50,
      x: am5.p50,
      paddingLeft: 10,
      marginTop: 5,
      marginBottom: 5,
    })
  );
  updateChart();
});
