// `nvm use 18 && npx tsx json_to_html.ts`

import * as fs from "fs";
import * as path from "path";
import dayjs from "dayjs";
import { fileURLToPath } from "url";

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type Post = {
  metadata: {
    published: {
      timestamp: string;
    };
  };
  content: string;
  labels?: string[];
};

function readJsonFile(filePath: string): Post[] {
  const data = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(data);
}

function writeHtmlFile(filePath: string, htmlContent: string): void {
  fs.writeFileSync(filePath, htmlContent, "utf-8");
}

function generateHtmlContent(posts: Post[]): string {
  let htmlContent = ` <html>
    <head>
      <link href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    </head>
    <body class="p-3">`;

  for (let i = 0; i < posts.length; i += 1) {
    const post = posts[i];
    const { timestamp } = post.metadata.published;
    const timestampFormatted = dayjs(timestamp).format("YYYY-MM-DD HH:mm:ss"); // TODO: How to show time zone in succinct way? https://day.js.org/docs/en/display/format
    const { content, labels } = post;

    htmlContent += `
      <div class="post">        
        <a href="#${timestamp}" class="d-block h2 mt-3">${timestampFormatted}</a>
        <a id="${timestamp}"></a>
        <div class="pl-3">
          <div class="content">
            ${content}
          </div>
          <div class="labels">
            ${labels?.join(", ")}
          </div>
        </div>
      </div>
    `;
    htmlContent += `</body>
    </html>`;
  }

  return htmlContent;
}

function convertJsonToHtml(jsonFilePath: string, htmlFilePath: string): void {
  const posts = readJsonFile(jsonFilePath);
  // Sort by timestamp ASC:
  const postsSorted = posts.sort((a, b) => {
    return (
      new Date(a.metadata.published.timestamp).getTime() -
      new Date(b.metadata.published.timestamp).getTime()
    );
  });
  const htmlContent = generateHtmlContent(postsSorted);
  writeHtmlFile(htmlFilePath, htmlContent);
}

// Usage
const jsonFilePath = path.join(__dirname, "blogger.json");
const htmlFilePath = path.join(__dirname, "blogger.html");

convertJsonToHtml(jsonFilePath, htmlFilePath);
