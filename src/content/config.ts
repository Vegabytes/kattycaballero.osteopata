import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    date: z.coerce.date().optional(),
    category: z.string(),
    image: z.string().optional(),
    readTime: z.number().optional(),
    author: z.string().default('Katy Caballero'),
  }),
});

export const collections = {
  'blog': blogCollection,
};
