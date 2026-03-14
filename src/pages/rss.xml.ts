import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = true;

export const GET: APIRoute = async () => {
  const posts = await getCollection('blog');

  const sortedPosts = posts.sort((a, b) => {
    const dateA = a.data.date || a.data.pubDate || new Date(0);
    const dateB = b.data.date || b.data.pubDate || new Date(0);
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  });

  const site = 'https://katycaballeroosteopata.com';

  const items = sortedPosts.map((post) => {
    const pubDate = post.data.date || post.data.pubDate;
    const description = post.data.excerpt || post.data.description || '';
    const link = `${site}/blog/${post.slug}/`;

    return `    <item>
      <title><![CDATA[${post.data.title}]]></title>
      <description><![CDATA[${description}]]></description>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>${pubDate ? `\n      <pubDate>${new Date(pubDate).toUTCString()}</pubDate>` : ''}${post.data.category ? `\n      <category><![CDATA[${post.data.category}]]></category>` : ''}
    </item>`;
  });

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Blog | Katy Caballero Osteópata</title>
    <description>Artículos sobre osteopatía, masajes, bienestar y salud</description>
    <link>${site}/blog/</link>
    <atom:link href="${site}/rss.xml" rel="self" type="application/rss+xml"/>
    <language>es</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <managingEditor>katycaballero.osteopata@gmail.com (Katy Caballero)</managingEditor>
    <webMaster>katycaballero.osteopata@gmail.com (Katy Caballero)</webMaster>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
