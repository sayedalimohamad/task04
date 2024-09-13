am5.ready(function () {
  var root = am5.Root.new("articles_by_keyword");
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
  document
    .getElementById("search-btn")
    .addEventListener("click", function (event) {
      event.preventDefault();
      const keywords = document
        .getElementById("keyword")
        .value.split(" ")
        .filter(Boolean);
      const uniqueKeywords = [...new Set(keywords)];
      if (uniqueKeywords.length > 0) {
        const dataPromises = uniqueKeywords.map((keyword) =>
          fetch(`/articles_by_keyword/${keyword}`)
            .then((response) => response.json())
            .then((data) => ({
              keyword,
              keywordCount: data.keywordCount,
              totalSize: data.totalSize,
            }))
        );
        Promise.all(dataPromises)
          .then((results) => {
            let totalKeywordCount = 0;
            let totalSize = results[0]?.totalSize || 0;
            const chartData = results.map((result) => {
              totalKeywordCount += result.keywordCount;
              return {
                category: `Have "${result.keyword}" Keyword`,
                value: result.keywordCount,
              };
            });
            chartData.push({
              category: `Not included in any keywords`,
              value: totalSize - totalKeywordCount,
            });
            series.data.setAll(chartData);
            series.appear(1000, 100);
          })
          .catch((error) => console.error("Error fetching data:", error));
      }
    });
});
