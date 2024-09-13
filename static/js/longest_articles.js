am5.ready(function () {
  var root = am5.Root.new("longest_articles");
  root.setThemes([am5themes_Animated.new(root)]);
  var chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      paddingLeft: 0,
      paddingRight: 30,
      wheelX: "zoomX",
      wheelY: "zoomY",
    })
  );
  var yRenderer = am5xy.AxisRendererY.new(root, {
    minorGridEnabled: true,
  });
  yRenderer.grid.template.set("visible", false);
  var yAxis = chart.yAxes.push(
    am5xy.CategoryAxis.new(root, {
      categoryField: "post_id",
      renderer: yRenderer,
      paddingRight: 40,
    })
  );
  var xRenderer = am5xy.AxisRendererX.new(root, {
    minGridDistance: 80,
    minorGridEnabled: true,
  });
  var xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, {
      min: 1,
      logarithmic: false,
      renderer: xRenderer,
    })
  );
  var series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      name: "Word Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueXField: "word_count",
      categoryYField: "post_id",
      sequencedInterpolation: true,
      calculateAggregates: true,
      tooltip: am5.Tooltip.new(root, {
        dy: -30,
        pointerOrientation: "vertical",
        labelText: "{valueX} words - {author}: {title}",
      }),
    })
  );
  series.columns.template.setAll({
    strokeOpacity: 0,
    cornerRadiusBR: 10,
    cornerRadiusTR: 10,
    cornerRadiusBL: 10,
    cornerRadiusTL: 10,
    maxHeight: 50,
    fillOpacity: 0.8,
  });
  var currentlyHovered;
  series.columns.template.events.on("pointerover", function (e) {
    handleHover(e.target.dataItem);
  });
  series.columns.template.events.on("pointerout", function (e) {
    handleOut();
  });
  function handleHover(dataItem) {
    if (dataItem && currentlyHovered !== dataItem) {
      handleOut();
      currentlyHovered = dataItem;
      var bullet = dataItem.bullets[0];
      bullet.animate({
        key: "locationX",
        to: 1,
        duration: 600,
        easing: am5.ease.out(am5.ease.cubic),
      });
    }
  }
  function handleOut() {
    if (currentlyHovered) {
      var bullet = currentlyHovered.bullets[0];
      bullet.animate({
        key: "locationX",
        to: 0,
        duration: 600,
        easing: am5.ease.out(am5.ease.cubic),
      });
    }
    currentlyHovered = null;
  }
  var circleTemplate = am5.Template.new({
    fill: am5.color(0x5faa46),
  });
  series.bullets.push(function (root, series, dataItem) {
    var bulletContainer = am5.Container.new(root, {});
    var circle = bulletContainer.children.push(
      am5.Circle.new(root, {
        radius: 34,
      })
    );
    var maskCircle = bulletContainer.children.push(
      am5.Circle.new(root, { radius: 27 })
    );
    var imageContainer = bulletContainer.children.push(
      am5.Container.new(root, {
        mask: maskCircle,
      })
    );
    var image = imageContainer.children.push(
      am5.Picture.new(root, {
        src: dataItem.dataContext.thumbnail,
        centerX: am5.p50,
        centerY: am5.p50,
        width: 60,
        height: 60,
      })
    );
    return am5.Bullet.new(root, {
      locationX: 0,
      sprite: bulletContainer,
    });
  });
  series.set("heatRules", [
    {
      dataField: "valueX",
      min: am5.color(0xe5dc36),
      max: am5.color(0x5faa46),
      target: series.columns.template,
      key: "fill",
    },
    {
      dataField: "valueX",
      min: am5.color(0xe5dc36),
      max: am5.color(0x5faa46),
      target: circleTemplate,
      key: "fill",
    },
  ]);
  fetch("/longest_articles")
    .then((response) => response.json())
    .then((data) => {
      var transformedData = data.map((item) => ({
        post_id: item.post_id,
        title: item.title,
        word_count: item.word_count,
        thumbnail: item.thumbnail,
        author: item.author,
      }));
      series.data.setAll(transformedData);
      yAxis.data.setAll(transformedData);
    })
    .catch((error) => console.error("Error fetching data:", error));
  var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
  cursor.lineX.set("visible", false);
  cursor.lineY.set("visible", false);
  cursor.events.on("cursormoved", function () {
    var dataItem = series.get("tooltip").dataItem;
    if (dataItem) {
      handleHover(dataItem);
    } else {
      handleOut();
    }
  });
  series.appear();
  chart.appear(1000, 100);
});
