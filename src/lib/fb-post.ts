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
    // Try to find existing bot user
    const botUser = await db.user.findUnique({
      where: {
        id: 'facebook-bot'
      }
    });

    if (!botUser) {
      // Create bot user if it doesn't exist
      await db.user.create({
        data: {
          id: 'facebook-bot',
          email: 'facebook-bot@system.local',
          name: 'Facebook Bot',
          // Add any other required fields for your User model
          // Make sure to set any required fields based on your schema
        }
      });
      console.log('Created Facebook bot user');
    }

    return 'facebook-bot';
  } catch (error) {
    console.error('Error ensuring Facebook bot user:', error);
    throw error;
  }
}

export async function savePostToDatabase(post: FacebookPost) {
  try {
    const createdAt = new Date(post.created_time);
    if (isNaN(createdAt.getTime())) {
      throw new Error(`Invalid date format: ${post.created_time}`);
    }

    // Get or create the Facebook bot user ID
    const botUserId = await ensureFacebookBotUser();

    await db.forumPost.create({
      data: {
        title: post.message.substring(0, 255), // Truncate title if needed
        body: post.message,
        createdById: botUserId,
        createdAt,
        image: post.full_picture, // Add image if available
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
    throw error; // Rethrow to handle it in the calling function
  }
}

export async function fetchAndSaveFacebookPosts() {
  const pageUrls = [
    'https://www.facebook.com/OfficialLRTA',
    'https://www.facebook.com/officialLRT1',
  ];

  try {
    // Ensure bot user exists before starting
    await ensureFacebookBotUser();

    console.log('Trying to fetch posts from pages:', pageUrls);
    for (const pageUrl of pageUrls) {
      console.log('Trying to fetch posts from page:', pageUrl);
      try {
        const posts = await scrapeFacebookPosts(pageUrl);
        console.log(`Fetched ${posts.length} posts from page ${pageUrl}`);
        
        // Process posts sequentially
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

export async function scrapeFacebookPosts(pageUrl: string): Promise<FacebookPost[]> {
  const browser = await puppeteer.launch({ 
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-notifications',
      '--disable-dev-shm-usage'
    ]
  });
  
  try {
    console.log('Launching browser...');
    const page = await browser.newPage();
    
    await page.setViewport({ width: 1280, height: 800 });
    
    // Set a user agent to appear more like a regular browser
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36');
    
    await page.setRequestInterception(true);
    page.on('request', (request) => {
      if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
        request.abort();
      } else {
        request.continue();
      }
    });

    console.log(`Navigating to ${pageUrl}...`);
    await page.goto(pageUrl, { 
      waitUntil: 'networkidle2',
      timeout: 60000
    });

    console.log('Waiting for content to load...');
    const feedSelectors = ['[role="feed"]', '[data-pagelet="FeedUnit"]', '.userContentWrapper'];
    for (const selector of feedSelectors) {
      try {
        await page.waitForSelector(selector, { timeout: 60000 });
        console.log(`Found feed with selector: ${selector}`);
        break;
      } catch (e) {
        if (e instanceof Error) {
          console.log(`Feed selector timeout for ${selector}:`, e.message);
        } else {
          console.log(`Feed selector timeout for ${selector}:`, e);
        }
      }
    }

    await autoScroll(page);
    await page.screenshot({ path: 'debug-screenshot.png' });

    const pageHtml = await page.content();
    console.log('Page HTML length:', pageHtml.length);

    // Enhanced selectors array
    const selectors = [
      '[role="article"]',
      'div[data-pagelet="FeedUnit"]',
      'div.x1yztbdb',
      'div.x1lliihq',
      '.userContentWrapper',
      '[data-ad-preview="message"]',
      '[data-ad-comet-preview="message"]'
    ];

    console.log('Starting post extraction...');
    const posts = await page.evaluate((selectors) => {
      const scrapedPosts: FacebookPost[] = [];
      
      function parseRelativeTime(timeText: string): string {
        const now = new Date();
        
        // Handle common Facebook time formats
        if (timeText.includes('hr') || timeText.includes('hrs')) {
          const hours = parseInt(timeText);
          return new Date(now.getTime() - hours * 60 * 60 * 1000).toISOString();
        }
        if (timeText.includes('min') || timeText.includes('mins')) {
          const minutes = parseInt(timeText);
          return new Date(now.getTime() - minutes * 60 * 1000).toISOString();
        }
        if (timeText.includes('Yesterday')) {
          return new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
        }
        
        // For dates like "March 15" or "March 15 at 2:30 PM"
        try {
          const date = new Date(timeText);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          console.log('Error parsing date:', timeText);
        }
        
        // Default to current time if parsing fails
        return now.toISOString();
      }
      
      for (const selector of selectors) {
        console.log(`Trying selector: ${selector}`);
        const elements = document.querySelectorAll(selector);
        console.log(`Found ${elements.length} elements with selector ${selector}`);
        
        elements.forEach((element, index) => {
          try {
            // Enhanced message selectors
            const messageSelectors = [
              '[data-ad-comet-preview="message"]',
              '[data-ad-preview="message"]',
              '.x193iq5w',
              '.xdj266r',
              '.userContent',
              'div[data-testid="post_message"]',
              'div[dir="auto"]'
            ];
            
            let message: string | null = null;
            for (const msgSelector of messageSelectors) {
              const msgElement = element.querySelector(msgSelector);
              if (msgElement?.textContent) {
                message = msgElement.textContent;
                break;
              }
            }

            // Enhanced time selectors
            const timeSelectors = [
              'a[role="link"] > span[class]',
              '.x1i10hfl time',
              '[role="link"] .x1i10hfl',
              'abbr[data-utime]',
              'span[id^="jsc"] a[role="link"]',
              'span.timestampContent',
              'a[role="link"] > span.x4k7w5x'
            ];
            
            let timeText: string | null = null;
            let createdTime: string | null = null;
            
            for (const timeSelector of timeSelectors) {
              const timeElement = element.querySelector(timeSelector);
              // Try datetime attribute first
              createdTime = timeElement?.getAttribute('datetime') || null;
              
              // If no datetime attribute, try text content
              if (!createdTime && timeElement?.textContent) {
                timeText = timeElement.textContent.trim();
                createdTime = parseRelativeTime(timeText);
              }
              
              if (createdTime) break;
            }

            // Get image if available
            const image = element.querySelector('img[alt]')?.getAttribute('src');
            
            // Get post link
            const linkSelectors = [
              'a[href*="/posts/"]',
              'a[href*="/photos/"]',
              'a[href*="/?story_fbid="]',
              'a[href*="/permalink/"]'
            ];
            
            let link: string | null = null;
            for (const linkSelector of linkSelectors) {
              const linkElement = element.querySelector(linkSelector);
              if (linkElement?.getAttribute('href')) {
                link = linkElement.getAttribute('href');
                break;
              }
            }

            // Debug logging for each post attempt
            console.log(`Post ${index} found:`, {
              hasMessage: !!message,
              messageLength: message?.length,
              timeText,
              createdTime,
              hasLink: !!link
            });

            if (message) {
              scrapedPosts.push({
                message: message.trim(),
                created_time: createdTime || new Date().toISOString(),
                full_picture: image || undefined,
                permalink_url: link || ''
              });
              console.log(`Successfully scraped post ${index + 1}`);
            }
          } catch (error) {
            console.error(`Error extracting post ${index + 1}:`, error);
          }
        });
        
        if (scrapedPosts.length > 0) {
          break;
        }
      }

      return scrapedPosts;
    }, selectors);

    console.log(`Scraping completed. Found ${posts.length} posts.`);
    return posts;

  } catch (error) {
    console.error('Error during scraping:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function autoScroll(page: Page): Promise<void> {
  console.log('Starting auto-scroll...');
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

// Schedule the function to run every hour
cron.schedule('0 * * * *', async () => {
  console.log('Scheduled fetch of Facebook posts...');
  await fetchAndSaveFacebookPosts();
});