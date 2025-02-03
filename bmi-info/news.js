document.addEventListener("DOMContentLoaded", function () {
  const apiKey = "dbf6f90cf4594aa1a765b38ac1a2fe1a";
  const keywords = ["Body Mass Index", "BMI", "Obesity", "Weight Loss"];
  const query = encodeURIComponent(keywords.join(" OR "));
  const fromDate = getFromDate(28);
  const defaultImage = "/assets/images/news-default-image.png";

  const topHeadlinesURL = `https://newsapi.org/v2/top-headlines?q=${query}&searchIn=title&from=${fromDate}&language=en&sortBy=publishedAt&apiKey=${apiKey}&category=health`;
  const everythingURL = `https://newsapi.org/v2/everything?q=${query}&searchIn=title&from=${fromDate}&language=en&sortBy=publishedAt&apiKey=${apiKey}`;

  const cacheKey = "news_cache";
  const cacheExpiryKey = "news_cache_expiry";
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);

  if (isCacheValid(cacheExpiryKey)) {
    renderNews(JSON.parse(localStorage.getItem(cacheKey)), defaultImage);
    return;
  }

  Promise.all([fetchNews(topHeadlinesURL), fetchNews(everythingURL)]).then(
    ([topHeadlinesData, everythingData]) => {
      const articles = [
        ...topHeadlinesData.articles,
        ...everythingData.articles,
      ].slice(0, 6);

      if (articles.length > 0) {
        localStorage.setItem(cacheKey, JSON.stringify(articles));
        localStorage.setItem(cacheExpiryKey, midnight);
        renderNews(articles, defaultImage);
      }
    }
  );
});

function fetchNews(url) {
  return fetch(url)
    .then((response) => {
      if (!response.ok)
        throw new Error(`HTTP error! Status: ${response.status}`);
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching news:", error);
      return { articles: [] };
    });
}

function getFromDate(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().split("T")[0];
}

function isCacheValid(cacheExpiryKey) {
  return (
    localStorage.getItem(cacheExpiryKey) &&
    new Date(localStorage.getItem(cacheExpiryKey)) > new Date()
  );
}

function renderNews(articles, defaultImage) {
  const sidebarWrapper = document.getElementById("bmi-sidebar-content-wrapper");
  let html = "";

  if (articles.length > 0) {
    const topHeadline = articles[0];
    html += `
        <div class="bmi-news-headlines">
          <div class="bmi-news-headline">
            <img src="${topHeadline.urlToImage}" alt="${topHeadline.title}" onerror="this.onerror=null;this.src='${defaultImage}';" />
            <div class="bmi-headline-description">
              <a href="${topHeadline.url}" target="_blank">${topHeadline.title}</a>
            </div>
          </div>
        </div>
      `;

    html += `<div class="bmi-news-others">`;
    articles.slice(1, 6).forEach((article) => {
      const publishedDate = formatDate(article.publishedAt);
      const imageSrc = article.urlToImage ? article.urlToImage : defaultImage;

      html += `
          <div class="bmi-news-other">
            <div class="bmi-news-content">
              <div class="bmi-news-source">
                <span>${article.source.name}</span> <span>•</span> <span>${publishedDate}</span>
              </div>
              <div class="bmi-news-title">
                <a href="${article.url}" target="_blank">${article.title}</a>
              </div>
            </div>
            <div class="bmi-news-image">
              <img src="${imageSrc}" alt="${article.title}" onerror="this.onerror=null;this.src='${defaultImage}';" />
            </div>
          </div>
        `;
    });
    html += `</div>`;
  }

  sidebarWrapper.innerHTML = html;
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}
