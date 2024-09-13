/*
  ***********************************************************
  top_classes_tag_cloud
  ***********************************************************
  */
fetch("/top_classes")
  .then((response) => response.json())
  .then((data) => {
    var processedData = data.map((item) => ({
      weight: item.count,
      tag: item._id.value,
    }));
    am5.ready(function () {
      var root = am5.Root.new("top_classes_tag_cloud");
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
          min: am5.color(0xffd4c2),
          max: am5.color(0xff621f),
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
