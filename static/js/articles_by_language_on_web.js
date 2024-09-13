am5.ready(function() {
    var root = am5.Root.new("articles_by_language_on_web");
    root.setThemes([
        am5themes_Animated.new(root)
      ]);
      var chart = root.container.children.push(am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50)
      }));
      var series = chart.series.push(am5percent.PieSeries.new(root, {
        valueField: "value",
        categoryField: "category",
        alignLabels: false
      }));
      series.labels.template.setAll({
        textType: "circular",
        centerX: 0,
        centerY: 0
      });
    series.data.setAll([
    //   it is random and fake value for now it will be replaced by real data from the database when we contains all the data
        { value: 10000, category: "Arabic" },
        { value: 5678, category: "English" },
        { value: 3254, category: "Spanish" },
      ]);
      var legend = chart.children.push(am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        marginTop: 15,
        marginBottom: 15,
      }));
      legend.data.setAll(series.dataItems);
      series.appear(1000, 100);
      }); 