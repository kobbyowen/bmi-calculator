document.addEventListener("DOMContentLoaded", async function () {
  const apiKey = "dbf6f90cf4594aa1a765b38ac1a2fe1a";
  const keywords = ["Body Mass Index", "BMI", "Obesity", "Weight Loss"];
  const query = encodeURIComponent(keywords.join(" OR "));
  const fromDate = getFromDate(28);
  const defaultImage = "/assets/images/news-default-image.png";
  const backupFile = "news.json";

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

  let articles = [];
  let isNewsLoadedFromBackup = false;

  try {
    const [topHeadlinesData, everythingData] = await Promise.all([
      fetchNews(topHeadlinesURL),
      fetchNews(everythingURL),
    ]);

    articles = [...topHeadlinesData.articles, ...everythingData.articles];

    if (articles.length === 0) {
      console.warn("No articles found from API. Loading from local JSON...");
      articles = await loadBackupNews(backupFile);
      isNewsLoadedFromBackup = true;
    }
  } catch (error) {
    console.error(
      "Error fetching API news, falling back to local file:",
      error
    );
    articles = await loadBackupNews(backupFile);
    isNewsLoadedFromBackup = true;
  }

  if (articles.length > 0) {
    localStorage.setItem(cacheKey, JSON.stringify(articles));
    localStorage.setItem(cacheExpiryKey, midnight);
    renderNews(articles, defaultImage);
  }
});

async function fetchNews(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error fetching news:", error);
    return { articles: [] };
  }
}

async function loadBackupNews(backupFile) {
  try {
    const response = await fetch(backupFile);
    if (!response.ok) throw new Error("Failed to load backup file");
    const data = await response.json();

    function shuffleArray(array) {
      return array.sort(() => Math.random() - 0.5);
    }

    const everythingArticles = shuffleArray([
      ...(data.everything?.articles || []),
    ]).slice(0, 6);
    const headlinesArticles = shuffleArray([
      ...(data.headlines?.articles || []),
    ]).slice(0, 3);

    return [...everythingArticles, ...headlinesArticles];
  } catch (error) {
    console.error("Failed to load backup news file:", error);
    return [];
  }
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
