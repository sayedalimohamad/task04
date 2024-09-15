fetch("/entities_by_type")
  .then((res) => res.json())
    .then((data) => {
        var processedData = data.map((item) => ({
            value: item.count,
            category: item._id,
            }));
        am5.ready(function() {

            // Create root element
            // https://www.amcharts.com/docs/v5/getting-started/#Root_element
            var root = am5.Root.new("entities_by_type");
            
            
            // Set themes
            // https://www.amcharts.com/docs/v5/concepts/themes/
            root.setThemes([
              am5themes_Animated.new(root)
            ]);
            
            
            // Create chart
            // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/
            var chart = root.container.children.push(am5percent.PieChart.new(root, {
              layout: root.verticalLayout
            }));
            
            
            // Create series
            // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Series
            var series = chart.series.push(am5percent.PieSeries.new(root, {
              alignLabels: true,
              calculateAggregates: true,
              valueField: "value",
              categoryField: "category"
            }));
            
            series.slices.template.setAll({
              strokeWidth: 3,
              stroke: am5.color(0xffffff)
            });
            
            series.labelsContainer.set("paddingTop", 30)
            
            
            // Set up adapters for variable slice radius
            // https://www.amcharts.com/docs/v5/concepts/settings/adapters/
            series.slices.template.adapters.add("radius", function (radius, target) {
              var dataItem = target.dataItem;
              var high = series.getPrivate("valueHigh");
            
              if (dataItem) {
                var value = target.dataItem.get("valueWorking", 0);
                return radius * value / high
              }
              return radius;
            });
            
            
            // Set data
            // https://www.amcharts.com/docs/v5/charts/percent-charts/pie-chart/#Setting_data
            series.data.setAll(processedData);
            
            
            // Create legend
            // https://www.amcharts.com/docs/v5/charts/percent-charts/legend-percent-series/
            var legend = chart.children.push(am5.Legend.new(root, {
              centerX: am5.p50,
              x: am5.p50,
              marginTop: 15,
              marginBottom: 15
            }));
            
            legend.data.setAll(series.dataItems);
            
            
            // Play initial series animation
            // https://www.amcharts.com/docs/v5/concepts/animations/#Animation_of_series
            series.appear(1000, 100);
            
            }); // end am5.ready()
      
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  });
