import { BrowserPage } from "@/lib/types";

export function generateSearchResults(query: string): BrowserPage[] {
  const q = query.toLowerCase();
  
  const defaultResults: BrowserPage[] = [
    { url: "https://example.com/result1", title: `Result 1 for ${query}`, content: `This is a generic result for ${query}.` },
    { url: "https://example.com/result2", title: `Result 2 for ${query}`, content: `More information about ${query} can be found here.` },
    { url: "https://example.com/result3", title: `Result 3 for ${query}`, content: `An alternative perspective on ${query}.` }
  ];

  if (q.includes('next.js') || q.includes('nextjs')) {
    return [
      { url: "https://nextjs.org", title: "Next.js by Vercel - The React Framework", content: "Next.js gives you the best developer experience with all the features you need for production: hybrid static & server rendering, TypeScript support, smart bundling, route pre-fetching, and more." },
      { url: "https://nextjs.org/docs", title: "Getting Started | Next.js", content: "Welcome to the Next.js documentation! If you're new to Next.js we recommend starting with the learn course." },
      { url: "https://vercel.com/solutions/nextjs", title: "Next.js on Vercel", content: "Deploy your Next.js app on Vercel for zero-configuration, optimal performance, and automatic scaling." }
    ];
  }

  if (q.includes('react')) {
    return [
      { url: "https://react.dev", title: "React", content: "The library for web and native user interfaces. React lets you build user interfaces out of individual pieces called components." },
      { url: "https://react.dev/reference/react", title: "React API Reference", content: "Detailed reference documentation for React hooks, components, and APIs." }
    ];
  }

  if (q.includes('typescript')) {
    return [
      { url: "https://www.typescriptlang.org", title: "TypeScript: JavaScript With Syntax For Types", content: "TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale." },
      { url: "https://www.typescriptlang.org/docs/", title: "TypeScript Documentation", content: "Learn TypeScript, from the basics to advanced type-level programming." }
    ];
  }

  return defaultResults;
}

export function generatePageContent(url: string): BrowserPage {
  return {
    url,
    title: `Page at ${url}`,
    content: `<h1>Welcome to ${url}</h1>\n<p>This is simulated content for the requested URL.</p>\n<p>Explore the features and enjoy the virtual experience.</p>`
  };
}
