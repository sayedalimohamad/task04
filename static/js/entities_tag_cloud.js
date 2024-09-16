fetch("/entities_tag_cloud")
  .then((response) => response.json())
  .then((data) => {
    var processedData = data.map((item) => ({
      weight: item.count,
      tag: item._id,
    }));
    am5.ready(function () {
      var root = am5.Root.new("entities_tag_cloud");
      root.setThemes([am5themes_Animated.new(root)]);
      var container = root.container.children.push(
        am5.Container.new(root, {
          width: am5.percent(100),
          height: am5.percent(100),
          layout: root.verticalLayout,
        })
      );
      var series = container.children.push(
        am5wc.WordCloud.new(root, {
          categoryField: "tag",
          valueField: "weight",
          calculateAggregates: true,
        })
      );
      series.set("heatRules", [
        {
          target: series.labels.template,
          dataField: "value",
          min: am5.color(0x1e272e),
          max: am5.color(0xff3f34),
          key: "fill",
          },
          
      ]);
      series.labels.template.setAll({
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: "Courier New",
        cursorOverStyle: "pointer",
      });
      series.data.setAll(processedData);
    });
  })
  .catch((error) => console.error("Error fetching data:", error));
