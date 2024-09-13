/*
  ***********************************************************
  articles_by_language
  ***********************************************************
  */
am5
  .ready(function () {
    fetch("/articles_by_language")
      .then((res) => res.json())
      .then((data) => {
        const formatted_data = data.map((item) => ({
          category: item._id,
          value: item.count,
        }));
        am5.ready(function () {
          var root = am5.Root.new("articles_by_language");
          root.setThemes([am5themes_Animated.new(root)]);
          var chart = root.container.children.push(
            am5percent.PieChart.new(root, {
              endAngle: 270,
            })
          );
          var series = chart.series.push(
            am5percent.PieSeries.new(root, {
              valueField: "value",
              categoryField: "category",
              endAngle: 270,
            })
          );
          series.states.create("hidden", {
            endAngle: -90,
          });
          series.data.setAll(formatted_data);
          series.appear(1000, 100);
        });
      });
  })
  .catch((err) => {
    console.log(err);
  });
