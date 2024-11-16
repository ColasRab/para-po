import puppeteer, { Page } from 'puppeteer';
import { db } from '@/db/index';
import cron from 'node-cron';

interface FacebookPost {
  message: string;
  created_time: string;
  full_picture?: string;
  permalink_url: string;
}

// Function to ensure the Facebook bot user exists
async function ensureFacebookBotUser() {
  try {
    const botUser = await db.user.findUnique({
      where: { id: 'facebook-bot' },
    });

    if (!botUser) {
      await db.user.create({
        data: {
          id: 'facebook-bot',
          email: 'facebook-bot@system.local',
          name: 'Facebook Bot',
        },
      });
      console.log('Created Facebook bot user');
    }

    return 'facebook-bot';
  } catch (error) {
    console.error('Error ensuring Facebook bot user:', error);
    throw error;
  }
}

// Function to check if a post already exists in the database
async function postExists(message: string, created_time: string): Promise<boolean> {
  const existingPost = await db.forumPost.findFirst({
    where: {
      title: message.substring(0, 255),
      createdAt: new Date(created_time),
    },
  });
  return existingPost !== null;
}

// Save post to the database
export async function savePostToDatabase(post: FacebookPost) {
  try {
    const createdAt = new Date(post.created_time);
    if (isNaN(createdAt.getTime())) {
      throw new Error(`Invalid date format: ${post.created_time}`);
    }

    // Check if the post already exists
    if (await postExists(post.message, post.created_time)) {
      console.log('Post already exists in the database:', post.message.substring(0, 100));
      return;
    }

    const botUserId = await ensureFacebookBotUser();

    await db.forumPost.create({
      data: {
        title: post.message.substring(0, 255),
        body: post.message,
        createdById: botUserId,
        createdAt,
        image: post.full_picture,
        tags: {
          connectOrCreate: {
            where: { name: 'Facebook' },
            create: { name: 'Facebook' },
          },
        },
      },
    });
    console.log('Post saved to database successfully:', post.message.substring(0, 100) + '...');
  } catch (error) {
    console.error('Error saving post to database:', error);
    throw error;
  }
}

// Fetch and save Facebook posts
export async function fetchAndSaveFacebookPosts() {
  const pageUrls = [
    'https://www.facebook.com/OfficialLRTA',
    'https://www.facebook.com/officialLRT1',
  ];

  try {
    await ensureFacebookBotUser();

    for (const pageUrl of pageUrls) {
      console.log('Fetching posts from page:', pageUrl);
      try {
        const posts = await scrapeFacebookPosts(pageUrl);
        console.log(`Fetched ${posts.length} posts from page ${pageUrl}`);
        
        for (const post of posts) {
          await savePostToDatabase(post).catch(error => {
            console.error(`Failed to save post: ${post.message.substring(0, 100)}...`, error);
          });
        }
      } catch (error) {
        console.error(`Error fetching posts from page ${pageUrl}:`, error);
      }
    }
  } catch (error) {
    console.error('Error in fetchAndSaveFacebookPosts:', error);
  }
}

// Scrape posts from Facebook page
export async function scrapeFacebookPosts(pageUrl: string): Promise<FacebookPost[]> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-notifications', '--disable-dev-shm-usage'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');

    // Enable request interception
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log(`Navigating to ${pageUrl}...`);
    await page.goto(pageUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    const feedSelectors = ['[role="feed"]', '[data-pagelet="FeedUnit"]', '.userContentWrapper', 'div[role="main"]'];
    let feedFound = false;
    for (const selector of feedSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 60000 });
        console.log(`Found feed with selector: ${selector}`);
        feedFound = true;
        break;
      } catch (e: any) {
        console.log(`Feed selector timeout for ${selector}:`, e.message);
      }
    }

    if (!feedFound) {
      console.error('No feed found on the page.');
      return [];
    }

    await autoScroll(page);

    const posts = await page.evaluate(() => {
      const scrapedPosts: FacebookPost[] = [];

      function parseRelativeTime(timeText: string): string {
        const now = new Date();

        if (timeText.includes('hr')) {
          const hours = parseInt(timeText);
          return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
        }
        if (timeText.includes('min')) {
          const minutes = parseInt(timeText);
          return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
        }
        if (timeText.includes('Yesterday')) {
          return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        }

        try {
          const date = new Date(timeText);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {}

        return now.toISOString();
      }

      const selectors = ['[role="article"]', 'div[data-pagelet="FeedUnit"]', '.userContentWrapper'];

      for (const selector of selectors) {
        const elements = document.querySelectorAll(selector);

        elements.forEach((element) => {
          try {
            const messageElement = element.querySelector('[data-ad-preview="message"], .userContent');
            const videoElement = element.querySelector('video');
            const message = videoElement ? element.querySelector('.userContent')?.textContent?.trim() : messageElement?.textContent?.trim();

            const timeElement = element.querySelector('abbr[data-utime], time');
            const createdTime = timeElement?.getAttribute('datetime') || parseRelativeTime(timeElement?.textContent || '');

            const linkElement = element.querySelector('a[href*="/posts/"], a[href*="/?story_fbid="]');
            const permalink = linkElement?.getAttribute('href');

            // Filter out comments and photo sections
            if (message && !message.toLowerCase().includes('comment') && !message.toLowerCase().includes('photo')) {
              scrapedPosts.push({
                message: message,
                created_time: createdTime || new Date().toISOString(),
                full_picture: undefined,
                permalink_url: permalink || '',
              });
            }
          } catch (error) {
            console.error('Error parsing post:', error);
          }
        });
      }

      return scrapedPosts;
    });

    return posts.filter(
      (post) =>
        post.message.length > 10 && // Minimum message length
        !post.message.toLowerCase().includes('see all photos') // Exclude specific keywords
    );
  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function autoScroll(page: Page): Promise<void> {
  await page.evaluate(async () => {
    await new Promise<void>((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const maxScrolls = 30; // Reduced max scrolls for testing
      let scrollCount = 0;
      let lastHeight = document.body.scrollHeight;
      
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        scrollCount++;

        // Log scroll progress
        console.log(`Scroll progress: ${totalHeight}/${scrollHeight}, count: ${scrollCount}`);

        // Check if we've reached the bottom or max scrolls
        if (totalHeight >= scrollHeight || scrollCount >= maxScrolls || lastHeight === scrollHeight) {
          clearInterval(timer);
          console.log('Scroll completed');
          resolve();
        }
        
        lastHeight = scrollHeight;
      }, 250); // Increased delay between scrolls
    });
  });
  console.log('Auto-scroll completed');
}

// Schedule the scraper
cron.schedule('0 * * * *', async () => {
  console.log('Scheduled fetch of Facebook posts...');
  await fetchAndSaveFacebookPosts();
});