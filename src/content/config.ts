import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    date: z.date(),
    category: z.string(),
    image: z.string(),
    readTime: z.number(),
    author: z.string().default('Katy Caballero'),
  }),
});

export const collections = {
  'blog': blogCollection,
};
