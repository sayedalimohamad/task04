/*
  ***********************************************************
  top-keywords
  ***********************************************************
  */
fetch("/top_keywords")
  .then((res) => res.json())
  .then((data) => {
    const topN = 100;
    let wordsArray = [];
    for (let i = 0; i < Math.min(topN, data.length); i++) {
      const item = data[i];
      for (let j = 0; j < item.count; j++) {
        wordsArray.push(item._id);
      }
    }
    const repeatedWords = wordsArray.join(" ");
    am5.ready(function () {
      var root = am5.Root.new("top-keywords");
      root.setThemes([am5themes_Animated.new(root)]);
      var zoomableContainer = root.container.children.push(
        am5.ZoomableContainer.new(root, {
          width: am5.p100,
          height: am5.p100,
          wheelable: true,
          pinchZoom: true,
        })
      );
      var zoomTools = zoomableContainer.children.push(
        am5.ZoomTools.new(root, {
          target: zoomableContainer,
        })
      );
      var series = zoomableContainer.contents.children.push(
        am5wc.WordCloud.new(root, {
          maxCount: 100,
          minWordLength: 2,
          maxFontSize: am5.percent(35),
          text: repeatedWords,
        })
      );
      series.labels.template.setAll({
        paddingTop: 5,
        paddingBottom: 5,
        paddingLeft: 5,
        paddingRight: 5,
        fontFamily: "Courier New",
        fill: am5.color(0xffffff),
      });
    });
  })
  .catch((err) => {
    console.log(err);
  });
