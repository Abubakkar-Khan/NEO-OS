import { expect } from 'chai';
import { generateSearchResults, generatePageContent } from '../src/services/browser';

describe('Browser Service (Mocha & Chai)', () => {
  it('returns specialized Next.js documentation results when query mentions next.js', () => {
    const results = generateSearchResults('Search for Next.js tutorial');
    expect(results).to.be.an('array');
    expect(results.length).to.be.at.least(2);
    expect(results[0].title).to.include('Next.js');
    expect(results[0].url).to.equal('https://nextjs.org');
  });

  it('returns React documentation results when query mentions react', () => {
    const results = generateSearchResults('learn react state hooks');
    expect(results).to.be.an('array');
    expect(results[0].url).to.equal('https://react.dev');
  });

  it('returns TypeScript results when query mentions typescript', () => {
    const results = generateSearchResults('typescript type gymnastics');
    expect(results).to.be.an('array');
    expect(results[0].url).to.equal('https://www.typescriptlang.org');
  });

  it('generates fallback search results for arbitrary queries', () => {
    const results = generateSearchResults('quantum computing algorithms');
    expect(results).to.be.an('array').with.lengthOf(3);
    expect(results[0].title).to.include('quantum computing algorithms');
  });

  it('generates simulated HTML page content for direct URLs', () => {
    const page = generatePageContent('https://neo-os.dev');
    expect(page).to.have.property('url', 'https://neo-os.dev');
    expect(page.content).to.include('Welcome to https://neo-os.dev');
  });
});
