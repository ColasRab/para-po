import { NextResponse } from 'next/server';
import { scrapeFacebookPosts, savePostToDatabase } from '@/lib/fb-post';

const pageUrls = [
  'https://www.facebook.com/OfficialLRTA',
  'https://www.facebook.com/officialLRT1',
];

export async function GET() {
  try {
    const results = [];
    for (const pageUrl of pageUrls) {
      const posts = await scrapeFacebookPosts(pageUrl);
      results.push(...posts);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping completed',
      results
    });
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST() {
  try {
    const results = [];
    for (const pageUrl of pageUrls) {
      const posts = await scrapeFacebookPosts(pageUrl);
      for (const post of posts) {
        await savePostToDatabase(post);
      }
      results.push(...posts);
    }

    return NextResponse.json({
      success: true,
      message: 'Scraping completed',
      results
    });
  } catch (error) {
    console.error('Scraping failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Scraping failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}