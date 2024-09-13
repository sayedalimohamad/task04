/*
  ***********************************************************
  recent_articles
  ***********************************************************
  */
fetch("/recent_articles")
  .then((response) => response.json())
  .then((data) => {
    const titleCounts = data.reduce((acc, item) => {
      if (acc[item.title]) {
        acc[item.title].count++;
      } else {
        acc[item.title] = { count: 1, date: new Date(item.last_updated) };
      }
      return acc;
    }, {});
    let processedData = Object.keys(titleCounts)
      .map((key) => ({
        category: key,
        value: titleCounts[key].count,
        date: titleCounts[key].date,
      }))
      .sort((a, b) => b.date - a.date);
    processedData = processedData.slice(0, 10);
    const maxDate = new Date(Math.max(...processedData.map((d) => d.date)));
    processedData = processedData.map((d) => ({
      category: d.category,
      value: (maxDate - d.date) / (1000 * 60 * 60 * 24),
    }));
    am5
      .ready(function () {
        var root = am5.Root.new("recent_articles");
        root.setThemes([am5themes_Animated.new(root)]);
        var series = root.container.children.push(
          am5wc.WordCloud.new(root, {
            maxCount: 100,
            minWordLength: 2,
            minFontSize: am5.percent(20),
            maxFontSize: am5.percent(10),
            angles: [0],
          })
        );
        var colorSet = am5.ColorSet.new(root, { step: 1 });
        series.labels.template.setAll({
          paddingTop: 5,
          paddingBottom: 5,
          paddingLeft: 5,
          paddingRight: 5,
          fontFamily: "Courier New",
        });
        series.labels.template.setup = function (label) {
          label.set(
            "background",
            am5.RoundedRectangle.new(root, {
              fillOpacity: 1,
              fill: colorSet.next(),
            })
          );
        };
        series.data.setAll(processedData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  });
